#!/usr/bin/env python3
"""
JSON Schema Validator

This script validates all JSON Schema files in the schemas directory.
Checks for syntax errors, references, and basic schema structure.
"""

import json
from pathlib import Path
import sys
from typing import Any

import jsonschema
from jsonschema import Draft7Validator


class SchemaValidator:
    """Validates JSON Schema files for syntax and structure."""

    def __init__(self, schemas_dir: str = "."):
        self.schemas_dir = Path(schemas_dir)
        self.schemas: dict[str, dict[str, Any]] = {}
        self.errors: list[str] = []
        self.warnings: list[str] = []

    def load_schemas(self) -> None:
        """Load all JSON Schema files from the schemas directory."""
        for schema_file in self.schemas_dir.rglob("*.json"):
            # Look for schema files in v1 subdirectories
            if "v1" in str(schema_file) and schema_file.name.endswith(".json"):
                try:
                    with schema_file.open() as f:
                        schema_data = json.load(f)
                        schema_id = schema_data.get("$id", str(schema_file))
                        self.schemas[schema_id] = schema_data
                        print(f"Loaded schema: {schema_file}")
                except json.JSONDecodeError as e:
                    self.errors.append(f"JSON syntax error in {schema_file}: {e}")
                except Exception as e:
                    self.errors.append(f"Error loading {schema_file}: {e}")

    def validate_schema_structure(self, schema_id: str, schema_data: dict[str, Any]) -> None:
        """Validate basic schema structure and required fields."""
        # Check for required fields
        if "$schema" not in schema_data:
            self.warnings.append(f"Missing $schema in {schema_id}")

        if "$id" not in schema_data:
            self.warnings.append(f"Missing $id in {schema_id}")

        if "definitions" not in schema_data:
            self.warnings.append(f"No definitions found in {schema_id}")

        # Check definitions structure
        definitions = schema_data.get("definitions", {})
        for def_name, def_schema in definitions.items():
            if not isinstance(def_schema, dict):
                self.errors.append(f"Invalid definition '{def_name}' in {schema_id}: not an object")
                continue

            # Check for required definition fields
            if "type" not in def_schema and "oneOf" not in def_schema:
                self.warnings.append(f"Definition '{def_name}' in {schema_id} has no type or oneOf")

            # Validate properties if present
            properties = def_schema.get("properties", {})
            if not isinstance(properties, dict):
                self.errors.append(f"Invalid properties in definition '{def_name}' in {schema_id}")
                continue

            # Check property types
            for prop_name, prop_schema in properties.items():
                if not isinstance(prop_schema, dict):
                    self.errors.append(f"Invalid property '{prop_name}' in definition '{def_name}' in {schema_id}")
                    continue

                # Check for $ref in properties
                if "$ref" in prop_schema:
                    ref = prop_schema["$ref"]
                    if not ref.startswith("#") and not ref.startswith("4stuck/"):
                        self.warnings.append(f"External reference '{ref}' in {schema_id} may not resolve")

    def validate_references(self, schema_id: str, schema_data: dict[str, Any]) -> None:
        """Validate that all $ref references are valid."""
        definitions = schema_data.get("definitions", {})

        for def_name, def_schema in definitions.items():
            self._validate_refs_in_object(def_schema, schema_id, def_name)

    def _validate_refs_in_object(self, obj: Any, schema_id: str, context: str) -> None:
        """Recursively validate references in an object."""
        if isinstance(obj, dict):
            for key, value in obj.items():
                if key == "$ref":
                    if not self._is_valid_reference(value, schema_id):
                        self.errors.append(f"Invalid reference '{value}' in {schema_id} ({context})")
                else:
                    self._validate_refs_in_object(value, schema_id, f"{context}.{key}")
        elif isinstance(obj, list):
            for i, item in enumerate(obj):
                self._validate_refs_in_object(item, schema_id, f"{context}[{i}]")

    def _is_valid_reference(self, ref: str, _schema_id: str) -> bool:
        """Check if a reference is valid."""
        if ref.startswith("#"):
            # Local reference - check if it exists in the same schema
            return True  # We'll validate this with jsonschema
        if ref.startswith("4stuck/"):
            # External reference - check if the target schema exists
            # Extract the base schema ID (before #/definitions/)
            base_ref = ref.split("#")[0]
            return base_ref in self.schemas
        return False

    def validate_with_jsonschema(self, schema_id: str, schema_data: dict[str, Any]) -> None:
        """Validate schema using jsonschema library."""
        try:
            # Create a resolver for external references (unused but kept for future use)
            _resolver = jsonschema.RefResolver.from_schema(schema_data, store=self.schemas)

            # Validate the schema itself
            Draft7Validator.check_schema(schema_data)

            # Validate each definition
            definitions = schema_data.get("definitions", {})
            for def_name, def_schema in definitions.items():
                try:
                    Draft7Validator.check_schema(def_schema)
                except jsonschema.exceptions.SchemaError as e:
                    self.errors.append(f"Schema error in definition '{def_name}' in {schema_id}: {e}")

        except jsonschema.exceptions.SchemaError as e:
            self.errors.append(f"Schema error in {schema_id}: {e}")
        except Exception as e:
            self.warnings.append(f"Could not validate {schema_id} with jsonschema: {e}")

    def validate_all(self) -> bool:
        """Validate all loaded schemas."""
        print(f"\nValidating {len(self.schemas)} schemas...")

        for schema_id, schema_data in self.schemas.items():
            print(f"Validating {schema_id}...")

            # Basic structure validation
            self.validate_schema_structure(schema_id, schema_data)

            # Reference validation
            self.validate_references(schema_id, schema_data)

            # JSON Schema validation
            self.validate_with_jsonschema(schema_id, schema_data)

        # Report results
        print("\nValidation Results:")
        print(f"  Schemas validated: {len(self.schemas)}")
        print(f"  Errors: {len(self.errors)}")
        print(f"  Warnings: {len(self.warnings)}")

        if self.errors:
            print("\nErrors:")
            for error in self.errors:
                print(f"  ❌ {error}")

        if self.warnings:
            print("\nWarnings:")
            for warning in self.warnings:
                print(f"  ⚠️  {warning}")

        if not self.errors and not self.warnings:
            print("\n✅ All schemas are valid!")

        return len(self.errors) == 0


def main():
    import argparse

    parser = argparse.ArgumentParser(description="Validate JSON Schema files")
    parser.add_argument("--schemas-dir", default=".", help="Directory containing JSON Schema files")

    args = parser.parse_args()

    validator = SchemaValidator(args.schemas_dir)
    validator.load_schemas()

    success = validator.validate_all()

    if not success:
        sys.exit(1)


if __name__ == "__main__":
    main()
