var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var stdin_exports = {};
__export(stdin_exports, {
  categorizeComponents: () => categorizeComponents,
  filterComponentsByCategory: () => filterComponentsByCategory,
  formatComponentDescription: () => formatComponentDescription,
  formatComponentTitle: () => formatComponentTitle,
  getComponentIcon: () => getComponentIcon,
  searchComponents: () => searchComponents,
  sortComponents: () => sortComponents,
  validateComponent: () => validateComponent
});
module.exports = __toCommonJS(stdin_exports);
const categorizeComponents = (components) => {
  const categories = {};
  const stats = {
    total: components.length,
    categories: 0,
    uncategorized: 0
  };
  components.forEach((component) => {
    const category = component.metadata?.category || "uncategorized";
    if (!categories[category]) {
      categories[category] = [];
      stats.categories++;
    }
    categories[category].push(component);
    if (category === "uncategorized") {
      stats.uncategorized++;
    }
  });
  return { categories, stats };
};
const searchComponents = (components, query) => {
  if (!query || query.trim() === "") {
    return components;
  }
  const searchTerm = query.toLowerCase().trim();
  return components.filter((component) => {
    const searchableFields = [
      component.metadata?.name,
      component.metadata?.type,
      component.metadata?.description,
      component.metadata?.category,
      component.metadata?.author
    ];
    return searchableFields.some(
      (field) => field && field.toLowerCase().includes(searchTerm)
    );
  });
};
const filterComponentsByCategory = (components, category) => {
  if (!category || category === "all") {
    return components;
  }
  return components.filter(
    (component) => (component.metadata?.category || "uncategorized") === category
  );
};
const sortComponents = (components, sortBy = "name", order = "asc") => {
  return [...components].sort((a, b) => {
    let aValue, bValue;
    switch (sortBy) {
      case "name":
        aValue = a.metadata?.name || "";
        bValue = b.metadata?.name || "";
        break;
      case "type":
        aValue = a.metadata?.type || "";
        bValue = b.metadata?.type || "";
        break;
      case "category":
        aValue = a.metadata?.category || "uncategorized";
        bValue = b.metadata?.category || "uncategorized";
        break;
      case "version":
        aValue = a.metadata?.version || "0.0.0";
        bValue = b.metadata?.version || "0.0.0";
        break;
      default:
        aValue = a.metadata?.name || "";
        bValue = b.metadata?.name || "";
    }
    const comparison = aValue.localeCompare(bValue);
    return order === "desc" ? -comparison : comparison;
  });
};
const validateComponent = (component) => {
  const errors = [];
  const warnings = [];
  if (!component.id) {
    errors.push("Component missing required id field");
  }
  if (!component.metadata) {
    errors.push("Component missing metadata");
  } else {
    if (!component.metadata.name) {
      warnings.push("Component missing name in metadata");
    }
    if (!component.metadata.type) {
      warnings.push("Component missing type in metadata");
    }
    if (!component.metadata.version) {
      warnings.push("Component missing version in metadata");
    }
  }
  if (!component.ui?.template) {
    warnings.push("Component missing UI template");
  }
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, 100 - errors.length * 25 - warnings.length * 5)
  };
};
const getComponentIcon = (component) => {
  const iconMap = {
    // Form elements
    button: "\u{1F518}",
    input: "\u{1F4DD}",
    textarea: "\u{1F4C4}",
    select: "\u{1F4CB}",
    checkbox: "\u2611\uFE0F",
    radio: "\u{1F518}",
    // Content elements
    text: "\u{1F4C4}",
    heading: "\u{1F4F0}",
    paragraph: "\u{1F4DD}",
    link: "\u{1F517}",
    image: "\u{1F5BC}\uFE0F",
    video: "\u{1F3A5}",
    // Layout elements
    container: "\u{1F4E6}",
    div: "\u{1F532}",
    section: "\u{1F4D1}",
    article: "\u{1F4F0}",
    header: "\u{1F3E0}",
    footer: "\u{1F9B6}",
    // Data elements
    table: "\u{1F4CA}",
    list: "\u{1F4CB}",
    chart: "\u{1F4C8}",
    graph: "\u{1F4CA}",
    // Interactive elements
    modal: "\u{1FA9F}",
    dropdown: "\u{1F4CB}",
    tooltip: "\u{1F4AC}",
    accordion: "\u{1F4C1}",
    // Navigation elements
    menu: "\u{1F354}",
    breadcrumb: "\u{1F35E}",
    pagination: "\u{1F4C4}",
    tabs: "\u{1F4D1}"
  };
  const componentType = component.metadata?.type?.toLowerCase();
  return iconMap[componentType] || "\u{1F9E9}";
};
const formatComponentTitle = (component) => {
  const { metadata } = component;
  if (!metadata)
    return "Unknown Component";
  const parts = [];
  if (metadata.name)
    parts.push(metadata.name);
  if (metadata.version)
    parts.push(`v${metadata.version}`);
  return parts.join(" ") || "Unnamed Component";
};
const formatComponentDescription = (component) => {
  const { metadata } = component;
  if (!metadata)
    return "No description available";
  const parts = [];
  if (metadata.description)
    parts.push(metadata.description);
  if (metadata.author)
    parts.push(`by ${metadata.author}`);
  return parts.join(" ") || "No description available";
};
