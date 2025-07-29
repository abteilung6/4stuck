#!/usr/bin/env python3
"""
JSON Schema to Pydantic Model Generator

This script converts JSON Schema definitions to Pydantic models for the FastAPI backend.
Supports v1 subdirectory structure and selective generation.
"""

import argparse
import json
from pathlib import Path
from typing import Any, Optional


class PythonGenerator:
    """Generates Python/Pydantic code from JSON Schema definitions."""

    def __init__(self, schemas_dir: str, output_dir: str, include_types: Optional[set[str]] = None):
        self.schemas_dir = Path(schemas_dir)
        self.output_dir = Path(output_dir)
        self.include_types = include_types or set()  # e.g., {'websocket', 'core', 'api'}
        self.schemas: dict[str, dict[str, Any]] = {}
        self.generated_files: list[str] = []

    def load_schemas(self) -> None:
        """Load all JSON Schema files from the schemas directory."""
        for schema_file in self.schemas_dir.rglob("*.json"):
            # Look for schema files in v1 subdirectories
            if "v1" in str(schema_file) and schema_file.name.endswith(".json"):
                with schema_file.open() as f:
                    schema_data = json.load(f)
                    schema_id = schema_data.get("$id", str(schema_file))
                    self.schemas[schema_id] = schema_data
                    print(f"Loaded schema: {schema_file}")

    def should_generate_schema(self, schema_id: str) -> bool:
        """Check if schema should be generated based on include_types filter."""
        if not self.include_types:
            return True  # Generate all if no filter specified

        # Check if schema type is in include_types
        return any(schema_type in schema_id for schema_type in self.include_types)

    def resolve_ref(self, ref: str) -> Optional[dict[str, Any]]:
        """Resolve a $ref to its target definition."""
        if ref.startswith("#"):
            # Local reference within same schema
            return None  # Will be handled by the schema processor
        if ref.startswith(("http", "4stuck")):
            # External reference
            return self.schemas.get(ref)
        return None

    def python_type_for_schema(self, schema: dict[str, Any]) -> str:
        """Convert JSON Schema type to Python type annotation."""
        schema_type = schema.get("type")

        if schema_type == "string":
            if "enum" in schema:
                return f"Literal[{', '.join(repr(v) for v in schema['enum'])}]"
            if schema.get("format") == "date-time":
                return "datetime"
            return "str"
        if schema_type == "integer":
            return "int"
        if schema_type == "number":
            return "float"
        if schema_type == "boolean":
            return "bool"
        if schema_type == "array":
            items_schema = schema.get("items", {})
            item_type = self.python_type_for_schema(items_schema)
            return f"List[{item_type}]"
        if schema_type == "object":
            return "Dict[str, Any]"
        if "oneOf" in schema:
            # Union type
            types = [self.python_type_for_schema(s) for s in schema["oneOf"]]
            return f"Union[{', '.join(types)}]"
        return "Any"

    def generate_field(self, name: str, schema: dict[str, Any], required_fields: list[str]) -> str:
        """Generate a Pydantic field definition."""
        field_type = self.python_type_for_schema(schema)

        # Handle required fields
        is_required = name in required_fields
        if not is_required:
            field_type = f"Optional[{field_type}]"

        # Add field description and default value for optional fields
        description = schema.get("description", "")
        if description:
            if is_required:
                return f'    {name}: {field_type} = Field(description="{description}")'
            return f'    {name}: {field_type} = Field(default=None, description="{description}")'
        if is_required:
            return f"    {name}: {field_type}"
        return f"    {name}: {field_type} = Field(default=None)"

    def generate_model(self, name: str, schema: dict[str, Any]) -> str:
        """Generate a Pydantic model from a schema definition."""
        lines = []

        # Add model docstring
        title = schema.get("title", name)
        description = schema.get("description", "")
        if description:
            lines.append(f"class {name}(BaseModel):")
            lines.append(f'    """{title}: {description}"""')
        else:
            lines.append(f"class {name}(BaseModel):")
            lines.append(f'    """{title}"""')

        # Add fields
        properties = schema.get("properties", {})
        required = schema.get("required", [])

        for field_name, field_schema in properties.items():
            field_line = self.generate_field(field_name, field_schema, required)
            lines.append(field_line)

        # Add model config
        lines.append("")
        lines.append("    class Config:")
        lines.append("        from_attributes = True")

        return "\n".join(lines)

    def generate_schema_file(self, schema_data: dict[str, Any], output_path: Path) -> None:
        """Generate a Python file from a JSON Schema file."""
        schema_id = schema_data.get("$id", "")
        definitions = schema_data.get("definitions", {})

        if not definitions:
            return

        # Determine module name from schema ID (unused but kept for future use)
        _module_name = self.get_module_name(schema_id)

        lines = []

        # Add imports
        lines.append('"""')
        lines.append(f"Auto-generated from {schema_id}")
        lines.append('"""')
        lines.append("")
        lines.append("from datetime import datetime")
        lines.append("from typing import Any, Dict, List, Optional, Union, Literal")
        lines.append("from pydantic import BaseModel, Field")
        lines.append("")

        # Generate models
        for model_name, model_schema in definitions.items():
            model_code = self.generate_model(model_name, model_schema)
            lines.append(model_code)
            lines.append("")

        # Write file
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with output_path.open("w") as f:
            f.write("\n".join(lines))

        self.generated_files.append(str(output_path))
        print(f"Generated: {output_path}")

    def get_module_name(self, schema_id: str) -> str:
        """Extract module name from schema ID."""
        # Extract the last part of the path
        parts = schema_id.split("/")
        filename = parts[-1] if parts else "unknown"
        # Remove .json extension
        return filename.replace(".json", "")

    def get_schema_type(self, schema_id: str) -> str:
        """Extract schema type from schema ID (core, websocket, api)."""
        if "core" in schema_id:
            return "core"
        if "websocket" in schema_id:
            return "websocket"
        if "api" in schema_id:
            return "api"
        return "unknown"

    def generate_all(self) -> None:
        """Generate all Python files from loaded schemas."""
        # Create output directory structure with v1 subdirectory
        self.output_dir.mkdir(parents=True, exist_ok=True)

        # Track all generated classes to avoid conflicts
        all_classes: dict[str, list[tuple[str, str]]] = {}

        # First pass: collect all class names from each module
        for schema_id, schema_data in self.schemas.items():
            if not self.should_generate_schema(schema_id):
                continue

            module_name = self.get_module_name(schema_id)
            schema_type = self.get_schema_type(schema_id)

            if "definitions" in schema_data:
                for class_name in schema_data["definitions"].keys():
                    if class_name not in all_classes:
                        all_classes[class_name] = []
                    all_classes[class_name].append((schema_type, module_name))

        # Generate __init__.py for main schemas directory with conflict resolution
        init_content = [
            '"""',
            "Auto-generated schemas from JSON Schema definitions",
            '"""',
            "",
            "# Core schemas",
            "from .v1.core.game import *",
            "from .v1.core.player import *",
            "from .v1.core.puzzle import *",
            "from .v1.core.communication import *",
            "",
            "# WebSocket schemas",
            "from .v1.websocket.messages import *",
            "",
            "# API schemas - import specific classes to avoid conflicts",
        ]

        # Add specific imports for API classes that might conflict with core classes
        api_classes = []
        for class_name, modules in all_classes.items():
            if len(modules) > 1:  # Class exists in multiple modules
                api_modules = [(t, m) for t, m in modules if t == "api"]
                if api_modules:
                    for schema_type, module_name in api_modules:
                        api_classes.append(f"from .v1.api.{module_name} import {class_name}")

        if api_classes:
            init_content.extend(api_classes)
        else:
            init_content.append("from .v1.api.requests import *")
            init_content.append("from .v1.api.responses import *")

        init_content.append("")

        init_path = self.output_dir / "__init__.py"
        with init_path.open("w") as f:
            f.write("\n".join(init_content))

        # Create v1 subdirectory
        v1_dir = self.output_dir / "v1"
        v1_dir.mkdir(exist_ok=True)

        # Generate v1 __init__.py with conflict resolution
        v1_init_content = [
            '"""',
            "Version 1 schemas",
            '"""',
            "",
            "from .core import *",
            "from .websocket import *",
        ]

        # Add specific imports for API classes that might conflict
        if api_classes:
            v1_init_content.extend([line.replace("from .v1.api.", "from .api.") for line in api_classes])
        else:
            v1_init_content.append("from .api import *")

        v1_init_content.append("")

        v1_init_path = v1_dir / "__init__.py"
        with v1_init_path.open("w") as f:
            f.write("\n".join(v1_init_content))

        # Generate schema files
        for schema_id, schema_data in self.schemas.items():
            # Check if this schema should be generated
            if not self.should_generate_schema(schema_id):
                print(f"Skipping schema (not in include filter): {schema_id}")
                continue

            module_name = self.get_module_name(schema_id)
            schema_type = self.get_schema_type(schema_id)

            # Determine output path with v1 subdirectory structure
            if schema_type == "core":
                output_path = v1_dir / "core" / f"{module_name}.py"
            elif schema_type == "websocket":
                output_path = v1_dir / "websocket" / f"{module_name}.py"
            elif schema_type == "api":
                output_path = v1_dir / "api" / f"{module_name}.py"
            else:
                output_path = v1_dir / f"{module_name}.py"

            self.generate_schema_file(schema_data, output_path)

        # Generate __init__.py files for subdirectories with conflict resolution
        for subdir in ["core", "websocket", "api"]:
            subdir_path = v1_dir / subdir
            if subdir_path.exists():
                subdir_init_content = ['"""', f"{subdir.title()} schemas", '"""', ""]

                # Add imports for all modules in this subdirectory
                for py_file in subdir_path.glob("*.py"):
                    if py_file.name != "__init__.py":
                        module_name = py_file.stem
                        subdir_init_content.append(f"from .{module_name} import *")

                subdir_init_path = subdir_path / "__init__.py"
                with subdir_init_path.open("w") as f:
                    f.write("\n".join(subdir_init_content))

        print(f"\nGenerated {len(self.generated_files)} files in {self.output_dir}/v1/")


def main():
    parser = argparse.ArgumentParser(description="Generate Python/Pydantic models from JSON Schema")
    parser.add_argument("--schemas-dir", default=".", help="Directory containing JSON Schema files")
    parser.add_argument("--output-dir", required=True, help="Output directory for generated Python files")
    parser.add_argument("--include", nargs="*", help="Only generate schemas of these types (core, websocket, api)")

    args = parser.parse_args()

    include_types = set(args.include) if args.include else set()

    generator = PythonGenerator(args.schemas_dir, args.output_dir, include_types)
    generator.load_schemas()
    generator.generate_all()


if __name__ == "__main__":
    main()
