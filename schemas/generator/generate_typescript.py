#!/usr/bin/env python3
"""
JSON Schema to TypeScript Interface Generator

This script converts JSON Schema definitions to TypeScript interfaces for the React frontend.
Supports v1 subdirectory structure and selective generation.
"""

import json
import os
import re
import sys
from pathlib import Path
from typing import Dict, List, Any, Optional, Set
import argparse


class TypeScriptGenerator:
    """Generates TypeScript interfaces from JSON Schema definitions."""
    
    def __init__(self, schemas_dir: str, output_dir: str, include_types: Optional[Set[str]] = None):
        self.schemas_dir = Path(schemas_dir)
        self.output_dir = Path(output_dir)
        self.include_types = include_types or set()
        self.schemas: Dict[str, Dict[str, Any]] = {}
        self.generated_files: List[str] = []
        
    def load_schemas(self) -> None:
        """Load all JSON Schema files from the schemas directory."""
        for schema_file in self.schemas_dir.rglob("*.json"):
            # Look for schema files in v1 subdirectories
            if "v1" in str(schema_file) and schema_file.name.endswith(".json"):
                with open(schema_file, 'r') as f:
                    schema_data = json.load(f)
                    schema_id = schema_data.get('$id', str(schema_file))
                    self.schemas[schema_id] = schema_data
                    print(f"Loaded schema: {schema_file}")
    
    def should_generate_schema(self, schema_id: str) -> bool:
        """Check if schema should be generated based on include_types filter."""
        if not self.include_types:
            return True  # Generate all if no filter specified
        
        # Check if schema type is in include_types
        for schema_type in self.include_types:
            if schema_type in schema_id:
                return True
        return False
    
    def typescript_type_for_schema(self, schema: Dict[str, Any]) -> str:
        """Convert JSON Schema type to TypeScript type annotation."""
        schema_type = schema.get('type')
        
        if schema_type == 'string':
            if 'enum' in schema:
                enum_values = [f"'{val}'" for val in schema['enum']]
                return f"({' | '.join(enum_values)})"
            elif schema.get('format') == 'date-time':
                return 'string'  # ISO date string
            else:
                return 'string'
        elif schema_type == 'integer':
            return 'number'
        elif schema_type == 'number':
            return 'number'
        elif schema_type == 'boolean':
            return 'boolean'
        elif schema_type == 'array':
            items_schema = schema.get('items', {})
            item_type = self.typescript_type_for_schema(items_schema)
            return f"{item_type}[]"
        elif schema_type == 'object':
            return 'Record<string, any>'
        elif 'oneOf' in schema:
            # Union type
            types = [self.typescript_type_for_schema(s) for s in schema['oneOf']]
            return f"{' | '.join(types)}"
        else:
            return 'any'
    
    def generate_interface(self, name: str, schema: Dict[str, Any]) -> str:
        """Generate a TypeScript interface from a schema definition."""
        lines = []
        
        # Add interface comment
        title = schema.get('title', name)
        description = schema.get('description', '')
        if description:
            lines.append(f'/** {title}: {description} */')
        else:
            lines.append(f'/** {title} */')
        
        lines.append(f'export interface {name} {{')
        
        # Add properties
        properties = schema.get('properties', {})
        required = schema.get('required', [])
        
        for prop_name, prop_schema in properties.items():
            prop_type = self.typescript_type_for_schema(prop_schema)
            
            # Handle optional properties
            if prop_name not in required:
                prop_name = f'{prop_name}?'
            
            # Add property comment
            prop_description = prop_schema.get('description', '')
            if prop_description:
                lines.append(f'  /** {prop_description} */')
            
            lines.append(f'  {prop_name}: {prop_type};')
        
        lines.append('}')
        
        return '\n'.join(lines)
    
    def generate_schema_file(self, schema_data: Dict[str, Any], output_path: Path) -> None:
        """Generate a TypeScript file from a JSON Schema file."""
        schema_id = schema_data.get('$id', '')
        definitions = schema_data.get('definitions', {})
        
        if not definitions:
            return
        
        # Determine module name from schema ID
        module_name = self.get_module_name(schema_id)
        
        lines = []
        
        # Add file header
        lines.append('/**')
        lines.append(f' * Auto-generated from {schema_id}')
        lines.append(' */')
        lines.append('')
        
        # Generate interfaces
        for interface_name, interface_schema in definitions.items():
            interface_code = self.generate_interface(interface_name, interface_schema)
            lines.append(interface_code)
            lines.append('')
        
        # Write file
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, 'w') as f:
            f.write('\n'.join(lines))
        
        self.generated_files.append(str(output_path))
        print(f"Generated: {output_path}")
    
    def get_module_name(self, schema_id: str) -> str:
        """Extract module name from schema ID."""
        parts = schema_id.split('/')
        filename = parts[-1] if parts else 'unknown'
        return filename.replace('.json', '')
    
    def get_schema_type(self, schema_id: str) -> str:
        """Extract schema type from schema ID (core, websocket, api)."""
        if 'core' in schema_id:
            return 'core'
        elif 'websocket' in schema_id:
            return 'websocket'
        elif 'api' in schema_id:
            return 'api'
        else:
            return 'unknown'
    
    def generate_all(self) -> None:
        """Generate all TypeScript files from loaded schemas."""
        # Create output directory structure with v1 subdirectory
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate index.ts for main schemas directory
        index_content = [
            '/**',
            ' * Auto-generated schemas from JSON Schema definitions',
            ' */',
            '',
            '// Core schemas',
            "export * from './v1/core/game';",
            "export * from './v1/core/player';",
            "export * from './v1/core/puzzle';",
            "export * from './v1/core/communication';",
            '',
            '// WebSocket schemas',
            "export * from './v1/websocket/messages';",
            '',
            '// API schemas',
            "export * from './v1/api/requests';",
            "export * from './v1/api/responses';",
            ''
        ]
        
        index_path = self.output_dir / 'index.ts'
        with open(index_path, 'w') as f:
            f.write('\n'.join(index_content))
        
        # Create v1 subdirectory
        v1_dir = self.output_dir / 'v1'
        v1_dir.mkdir(exist_ok=True)
        
        # Generate v1 index.ts
        v1_index_content = [
            '/**',
            ' * Version 1 schemas',
            ' */',
            '',
            "export * from './core';",
            "export * from './websocket';",
            "export * from './api';",
            ''
        ]
        
        v1_index_path = v1_dir / 'index.ts'
        with open(v1_index_path, 'w') as f:
            f.write('\n'.join(v1_index_content))
        
        # Generate schema files
        for schema_id, schema_data in self.schemas.items():
            # Check if this schema should be generated
            if not self.should_generate_schema(schema_id):
                print(f"Skipping schema (not in include filter): {schema_id}")
                continue
            
            module_name = self.get_module_name(schema_id)
            schema_type = self.get_schema_type(schema_id)
            
            # Determine output path with v1 subdirectory structure
            if schema_type == 'core':
                output_path = v1_dir / 'core' / f'{module_name}.ts'
            elif schema_type == 'websocket':
                output_path = v1_dir / 'websocket' / f'{module_name}.ts'
            elif schema_type == 'api':
                output_path = v1_dir / 'api' / f'{module_name}.ts'
            else:
                output_path = v1_dir / f'{module_name}.ts'
            
            self.generate_schema_file(schema_data, output_path)
        
        # Generate index.ts files for subdirectories
        for subdir in ['core', 'websocket', 'api']:
            subdir_path = v1_dir / subdir
            if subdir_path.exists():
                subdir_index_content = [
                    '/**',
                    f' * {subdir.title()} schemas',
                    ' */',
                    ''
                ]
                
                # Add exports for all modules in this subdirectory
                for ts_file in subdir_path.glob('*.ts'):
                    if ts_file.name != 'index.ts':
                        module_name = ts_file.stem
                        subdir_index_content.append(f"export * from './{module_name}';")
                
                subdir_index_path = subdir_path / 'index.ts'
                with open(subdir_index_path, 'w') as f:
                    f.write('\n'.join(subdir_index_content))
        
        print(f"\nGenerated {len(self.generated_files)} files in {self.output_dir}/v1/")


def main():
    parser = argparse.ArgumentParser(description='Generate TypeScript interfaces from JSON Schema')
    parser.add_argument('--schemas-dir', default='.', help='Directory containing JSON Schema files')
    parser.add_argument('--output-dir', required=True, help='Output directory for generated TypeScript files')
    parser.add_argument('--include', nargs='*', help='Only generate schemas of these types (core, websocket, api)')
    
    args = parser.parse_args()
    
    include_types = set(args.include) if args.include else set()
    
    generator = TypeScriptGenerator(args.schemas_dir, args.output_dir, include_types)
    generator.load_schemas()
    generator.generate_all()


if __name__ == '__main__':
    main() 