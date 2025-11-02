---
slug: test-tree
title: Test TreeItems
authors: [christophe]
image: /img/v2/devcontainer_quarto.webp
date: 2025-11-11
---

## tree expanded=true

```tree expanded=true
.
├── src
│   ├── components
│   │   ├── Trees
│   │   │   └── index.js
│   │   └── App.jsx
│   └── index.js
└── TreeItem.js

```

## tree expanded=false

```tree
.
├── src
│   ├── components
│   │   ├── Trees
│   │   │   └── index.js
│   │   └── App.jsx
│   └── index.js
└── TreeItem.js

```

## Generated

<Trees>
    <Folder label="src" expanded={true} icon="mdi:folder">
        <Folder label="components" expanded={true} icon="mdi:folder">
            <Folder label="Trees" expanded={false} icon="mdi:folder">
                <File label="index.js" icon="logos:javascript" />
            </Folder>
            <File label="App.jsx" icon="ph:empty" />
        </Folder>
        <File label="index.js" icon="logos:javascript" />
    </Folder>
    <File label="TreeItem.js" icon="logos:javascript" />
</Trees>

<Trees>
    <Folder label="src" icon="mdi:folder">
        <Folder label="components" icon="mdi:folder">
            <Folder label="Trees" icon="mdi:folder">
                <File label="index.js" icon="logos:javascript" />
            </Folder>
            <File label="App.jsx" icon="ph:empty" />
        </Folder>
        <File label="index.js" icon="logos:javascript" />
    </Folder>
    <File label="TreeItem.js" icon="logos:javascript" />
</Trees>
