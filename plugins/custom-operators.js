export const operators = {
  hasMinLines: (content, minLines) => {
    const lines = content.split('\n').length;
    return lines >= minLines;
  },
  
  hasMaxLines: (content, maxLines) => {
    const lines = content.split('\n').length;
    return lines <= maxLines;
  },
  
  containsImport: (content, importName) => {
    const importRegex = new RegExp(`import.*${importName}`, 'i');
    return importRegex.test(content);
  },
  
  followsNamingConvention: (fileName, convention) => {
    switch (convention) {
      case 'kebab-case':
        return /^[a-z0-9]+(-[a-z0-9]+)*\.[a-z]+$/.test(fileName);
      case 'camelCase':
        return /^[a-z][a-zA-Z0-9]*\.[a-z]+$/.test(fileName);
      case 'PascalCase':
        return /^[A-Z][a-zA-Z0-9]*\.[a-z]+$/.test(fileName);
      default:
        return true;
    }
  }
};