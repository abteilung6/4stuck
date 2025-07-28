#!/usr/bin/env python3
"""
JSON Schema to Pydantic Model Generator

This script converts JSON Schema definitions to Pydantic models for the FastAPI backend.
"""

import json
import os
import re
import sys
from pathlib import Path
from typing import Dict, List, Any, Optional
import argparse


class PythonGenerator:
    """Generates Python/Pydantic code from JSON Schema definitions."""
    
    def __init__(self, schemas_dir: str, output_dir: str):
        self.schemas_dir = Path(schemas_dir)
        self.output_dir = Path(output_dir)
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
    
    def resolve_ref(self, ref: str) -> Optional[Dict[str, Any]]:
        """Resolve a $ref to its target definition."""
        if ref.startswith('#'):
            # Local reference within same schema
            return None  # Will be handled by the schema processor
        elif ref.startswith('http'):
            # External reference
            return self.schemas.get(ref)
        return None
    
    def python_type_for_schema(self, schema: Dict[str, Any]) -> str:
        """Convert JSON Schema type to Python type annotation."""
        schema_type = schema.get('type')
        
        if schema_type == 'string':
            if 'enum' in schema:
                return f"Literal[{', '.join(repr(v) for v in schema['enum'])}]"
            elif schema.get('format') == 'date-time':
                return 'datetime'
            else:
                return 'str'
        elif schema_type == 'integer':
            return 'int'
        elif schema_type == 'number':
            return 'float'
        elif schema_type == 'boolean':
            return 'bool'
        elif schema_type == 'array':
            items_schema = schema.get('items', {})
            item_type = self.python_type_for_schema(items_schema)
            return f"List[{item_type}]"
        elif schema_type == 'object':
            return 'Dict[str, Any]'
        elif 'oneOf' in schema:
            # Union type
            types = [self.python_type_for_schema(s) for s in schema['oneOf']]
            return f"Union[{', '.join(types)}]"
        else:
            return 'Any'
    
    def generate_field(self, name: str, schema: Dict[str, Any]) -> str:
        """Generate a Pydantic field definition."""
        field_type = self.python_type_for_schema(schema)
        
        # Handle required fields
        required = schema.get('required', True)
        if not required:
            field_type = f"Optional[{field_type}]"
        
        # Add field description
        description = schema.get('description', '')
        if description:
            return f'    {name}: {field_type} = Field(description="{description}")'
        else:
            return f'    {name}: {field_type}'
    
    def generate_model(self, name: str, schema: Dict[str, Any]) -> str:
        """Generate a Pydantic model from a schema definition."""
        lines = []
        
        # Add model docstring
        title = schema.get('title', name)
        description = schema.get('description', '')
        if description:
            lines.append(f'class {name}(BaseModel):')
            lines.append(f'    """{title}: {description}"""')
        else:
            lines.append(f'class {name}(BaseModel):')
            lines.append(f'    """{title}"""')
        
        # Add fields
        properties = schema.get('properties', {})
        required = schema.get('required', [])
        
        for field_name, field_schema in properties.items():
            field_schema['required'] = field_name in required
            field_line = self.generate_field(field_name, field_schema)
            lines.append(field_line)
        
        # Add model config
        lines.append('')
        lines.append('    class Config:')
        lines.append('        from_attributes = True')
        
        return '\n'.join(lines)
    
    def generate_schema_file(self, schema_data: Dict[str, Any], output_path: Path) -> None:
        """Generate a Python file from a JSON Schema file."""
        schema_id = schema_data.get('$id', '')
        definitions = schema_data.get('definitions', {})
        
        if not definitions:
            return
        
        # Determine module name from schema ID
        module_name = self.get_module_name(schema_id)
        
        lines = []
        
        # Add imports
        lines.append('"""')
        lines.append(f'Auto-generated from {schema_id}')
        lines.append('"""')
        lines.append('')
        lines.append('from datetime import datetime')
        lines.append('from typing import Any, Dict, List, Optional, Union, Literal')
        lines.append('from pydantic import BaseModel, Field')
        lines.append('')
        
        # Generate models
        for model_name, model_schema in definitions.items():
            model_code = self.generate_model(model_name, model_schema)
            lines.append(model_code)
            lines.append('')
        
        # Write file
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, 'w') as f:
            f.write('\n'.join(lines))
        
        self.generated_files.append(str(output_path))
        print(f"Generated: {output_path}")
    
    def get_module_name(self, schema_id: str) -> str:
        """Extract module name from schema ID."""
        # Extract the last part of the path
        parts = schema_id.split('/')
        filename = parts[-1] if parts else 'unknown'
        # Remove .json extension
        return filename.replace('.json', '')
    
    def generate_all(self) -> None:
        """Generate all Python files from loaded schemas."""
        # Create output directory structure
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate __init__.py
        init_content = [
            '"""',
            'Auto-generated schemas from JSON Schema definitions',
            '"""',
            '',
            '# Core schemas',
            'from .core.game import *',
            'from .core.player import *',
            'from .core.puzzle import *',
            'from .core.communication import *',
            '',
            '# WebSocket schemas',
            'from .websocket.messages import *',
            '',
            '# API schemas',
            'from .api.requests import *',
            'from .api.responses import *',
            ''
        ]
        
        init_path = self.output_dir / '__init__.py'
        with open(init_path, 'w') as f:
            f.write('\n'.join(init_content))
        
        # Generate schema files
        for schema_id, schema_data in self.schemas.items():
            module_name = self.get_module_name(schema_id)
            
            # Determine output path based on schema type
            if 'core' in schema_id:
                output_path = self.output_dir / 'core' / f'{module_name}.py'
            elif 'websocket' in schema_id:
                output_path = self.output_dir / 'websocket' / f'{module_name}.py'
            elif 'api' in schema_id:
                output_path = self.output_dir / 'api' / f'{module_name}.py'
            else:
                output_path = self.output_dir / f'{module_name}.py'
            
            self.generate_schema_file(schema_data, output_path)
        
        print(f"\nGenerated {len(self.generated_files)} files in {self.output_dir}")


def main():
    parser = argparse.ArgumentParser(description='Generate Python/Pydantic models from JSON Schema')
    parser.add_argument('--schemas-dir', default='.', help='Directory containing JSON Schema files')
    parser.add_argument('--output-dir', required=True, help='Output directory for generated Python files')
    
    args = parser.parse_args()
    
    generator = PythonGenerator(args.schemas_dir, args.output_dir)
    generator.load_schemas()
    generator.generate_all()


if __name__ == '__main__':
    main() 