# Document Property Sorting Tool

Automatically sorts front matter properties of documents to maintain consistent document structure.

## Main Features

- Supports custom property sorting rules
- Supports ignoring specific folders and files
- Supports manual trigger for sorting

## Usage

1. Enable the "Document Property Sorting" tool in settings
2. Configure property sorting rules and ignore rules
3. Choose between automatic sorting or manual trigger

## Sorting Rule Settings

1. Property Order
   - Supports custom property sorting order
   - Supports multi-line input, one property name per line
   - Example:
     ```
     title
     date
     tags
     author
     ```

2. Ignore Rules
   - Ignore folders: Supports multi-line input, one folder path per line
   - Ignore files: Supports multi-line input, one file path per line
   - Supports wildcards (* and ?)

## Notes

- Sorting rules are applied in the configured order
- Properties not specified in sorting rules are placed at the end
- Ignore rules take precedence over sorting rules
- Manual trigger sorting does not affect ignored files 