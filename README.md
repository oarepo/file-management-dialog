# OARepo File Management Dialog

![Version](https://img.shields.io/github/package-json/v/oarepo/file-management-dialog) [![License](https://img.shields.io/github/license/oarepo/file-management-dialog)](https://github.com/oarepo/file-management-dialog/blob/main/LICENSE) ![Build Status](https://github.com/oarepo/file-management-dialog/actions/workflows/chromatic.yml/badge.svg
)

This package provides a file management dialog for OARepo.

## Installation

```bash
npm install @oarepo/file-manager
```

## Usage

```jsx
import FileManagementDialog from '@oarepo/file-manager'

const MyComponent = () => {
  const [open, setOpen] = useState(false)
  const [files, setFiles] = useState([])

  return (
    <>
      <button onClick={() => setOpen(true)}>Open dialog</button>
      <FileManagementDialog
        open={open}
        onClose={() => setOpen(false)}
        files={files}
        setFiles={setFiles}
      />
    </>
  )
}
```