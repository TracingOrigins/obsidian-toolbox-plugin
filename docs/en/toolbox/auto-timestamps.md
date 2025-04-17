# Automatic Timestamp Tool

Automatically adds creation and modification timestamps to documents.

## Main Features

- Automatically add creation time
- Automatically add modification time
- Customizable time format
- Configurable modification time update interval
- Support for ignoring specific folders, files, and tags

## Usage

1. Enable the "Automatic Timestamp" tool in settings
2. Configure time format and update interval
3. Configure folders, files, and tags to ignore

## Time Format Settings

Supports [Moment.js](https://momentjs.com/docs/#/displaying/format/) format strings, for example:
- `YYYY-MM-DD HH:mm:ss` (default)
- `YYYY/MM/DD HH:mm`
- `MM-DD HH:mm`

## Ignore Rule Settings

### 1. Ignore Folders
- Supports multi-line input, one folder per line
- Supports wildcards (* and ?)
- Example:
  ```
  .templates
  attachments/*
  daily/*
  ```

### 2. Ignore Files
- Supports multi-line input, one file per line
- Supports wildcards (* and ?)
- Example:
  ```
  *.png
  *.jpg
  !important.md
  ```

### 3. Ignore Tags
- Supports multi-line input, one tag per line
- Supports wildcards (* and ?)
- Supports tags in document content and document properties
- Example:
  ```
  #draft
  #temp/*
  #review
  ```

## Notes

- Ignore rules apply to tags in both document content and document properties
- Tag matching supports nested tags (e.g., `#tag/subtag`)
- Tags in ignore rules can be with or without the `#` symbol
- Modification time updates automatically based on the set interval to avoid frequent updates 