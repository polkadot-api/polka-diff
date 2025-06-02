# Polkadot Runtime Diff Viewer

A UI for comparing Polkadot runtimes and visualizing the differences between two runtime versions.
This tool helps developers, runtime-developers, and governance participants understand the impact of runtime upgrades by
providing detailed analysis of changes.

## 🚀 Features

### 📊 **Comprehensive Runtime Analysis**

- **Visual Diff Overview**: Dashboard showing counts of added, removed, modified, and unchanged items
- **Detailed Change Breakdown**: Organized by pallets and grouped by change type
- **Compatibility Assessment**: Color-coded compatibility levels (Incompatible, Partial, Backwards Compatible)
- **Interactive Navigation**: Click overview cards to navigate between different change categories
- **Compatibility Filters**: Filter modified items by compatibility level

### 🔌 **Multiple Data Sources**

- **WebSocket Connection**: Use a WebSocket Provider to access an old or current runtime
- **Hex Metadata**: Paste the runtime's metadata as hex strings
- **File Upload**: Upload either the WASM of a runtime, or its SCALE encoded metadata

## 🏗️ Technical Details

### **Item Types**

- **Pallets**: Runtime module
- **Transactions**: Calls within pallets
- **Storage**: On-chain storage items
- **Constants**: Runtime constants
- **Runtime APIs**: Available runtime API methods (only available in Metadata >=v15 runtimes)
- \*_Views_: View functions (only available in Metadata >=v16 runtimes)

### **Compatibility Levels**

- 🔴 **Incompatible**: Breaking changes that require careful migration
- 🟡 **Partial**: Changes with potential compatibility issues
- 🟢 **Backwards Compatible**: Safe changes with no breaking impact

### **Change Categories**

- **Added**: New items introduced in the target runtime
- **Removed**: Items that existed in source but not in target
- **Modified**: Items that exist in both but have differences
- **Unchanged**: Items that are identical between runtimes

## 🎯 Use Cases

### **Runtime Upgrade Analysis**

- Compare proposed runtime upgrades against current versions
- Identify breaking changes before deployment
- Assess migration requirements for applications

### **Cross-Chain Comparison**

- Compare runtimes between different networks
- Analyze feature differences between networks
- Understand compatibility between chain versions

### **Development & Testing**

- Validate runtime changes during development
- Ensure backwards compatibility in updates
- Document changes for release notes

### **Governance & Validation**

- Review proposed runtime upgrades for voting
- Understand the impact of governance proposals
- Make informed decisions on runtime changes

## 🤝 Contributing

We welcome contributions! Please feel free to submit issues, feature requests, or pull requests.

---

**Built by PAPI with ❤️  for the Polkadot ecosystem**
