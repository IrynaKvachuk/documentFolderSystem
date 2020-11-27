const data = [
  {
    'folder': true,
    'title': 'Grow',
    'children': [
      {
        'title': 'logo.png'
      },
      {
        'folder': true,
        'title': 'English',
        'children': [
          {
            'title': 'Present_Perfect.txt'
          }
        ]
      }
    ]
  },
  {
    'folder': true,
    'title': 'Soft',
    'children': [
      {
        'folder': true,
        'title': 'NVIDIA',
        'children': null
      },
      {
        'title': 'nvm-setup.exe'
      },
      {
        'title': 'node.exe'
      }
    ]
  },
  {
    'folder': true,
    'title': 'Doc',
    'children': [
      {
        'title': 'project_info.txt'
      }
    ]
  },
  {
    'title': 'credentials.txt'
  }
];

const rootNode = document.getElementById('root');
let rightMenuVisible = false;
let focusedOption;

const createElement = (type, attributes, parent) => {
  const element = document.createElement(type);
  const attributeKeys = Object.keys(attributes);

  attributeKeys.forEach(function setAttributes(key) {
    switch (key) {
      case 'classes':
        element.classList.add.apply(element.classList, attributes[key]);
        break;
      case 'text':
        element.innerHTML = attributes[key];
        break;
      default:
        element.setAttribute(key, attributes[key]);
    }
  })
  if (parent !== undefined) {
    parent.appendChild(element);
  }

  return element;
}

const openFolder = (items, parent) => {
  if (items !== null && items.length > 0) {
    createFolderStructure(items, parent);
  } else {
    const ul = createElement('ul', { classes: ['list'] });
    createElement('li', { classes: ['list-option', 'empty-folder'], text: 'Folder is empty' }, ul);
    parent.appendChild(ul);
  }
}

const closeFolder = (parent) => {
  parent.removeChild(parent.querySelector('.list'));
}

const setPosition = (menu, { top, left }) => {
  menu.style.left = `${left}px`;
  menu.style.top = `${top}px`;
  menu.style.display = 'block';
  rightMenuVisible = true;
}

const rightMenu = (parent) => {
  const div = createElement('div', { classes: ['right-menu'] });

  createElement('button', { id: 'rename', classes: ['right-menu-option'], text: 'Rename' }, div);
  createElement('button', { id: 'delete', classes: ['right-menu-option'], text: 'Delete item' }, div);
  parent.appendChild(div);

  return div;
}

const showRightMenu = (event, menu, renameBtn, deleteBtn, origin) => {
  event.preventDefault();
  setPosition(menu, origin);
  if (focusedOption && focusedOption !== event.target) {
    focusedOption.classList.remove('focused-option');
  }
  focusedOption = event.target;
  focusedOption.classList.add('focused-option');
  renameBtn.disabled = false;
  deleteBtn.disabled = false;
}

const renameElement = (element, item) => {
  const oldValue = element.textContent;
  let inputRemoved = false;
  const renameInput = createElement('input', { classes: ['rename-input'], type: 'text', value: oldValue });

  element.innerHTML = '';
  element.appendChild(renameInput);
  renameInput.setSelectionRange(0, renameInput.value.lastIndexOf('.'));
  renameInput.focus();

  ['click', 'blur', 'keypress'].forEach(eventType => {
    renameInput.addEventListener(eventType, function changeValue(e) {
      const enterKeyCode = 13;
      if (!inputRemoved && (!e.keyCode || e.keyCode === enterKeyCode)) {
        inputRemoved = true;
        item.title = renameInput.value;
        element.innerHTML = item.title;
      }
    }, false)
  })
}

const createFolder = (item, parent, toggleElement) => {
  if (item.open === true) {
    createElement('i', { classes: ['material-icons', 'yellow'], text: 'folder_open' }, parent);
    openFolder(item.children, parent);
  } else {
    createElement('i', { classes: ['material-icons', 'yellow'], text: 'folder' }, parent);
    item.open = false
  }
  toggleElement.addEventListener('click', function toggleFolder(e) {
    if (e.target && e.target.classList.contains('option-name')) {
      const folderIcon = e.target.closest('.list-option').firstChild;

      if (item.open === true) {
        closeFolder(parent);
        folderIcon.innerText = 'folder';
        item.open = false;
      } else {
        openFolder(item.children, parent);
        folderIcon.innerText = 'folder_open';
        item.open = true;
      }
    }
  }, false);
}

const createFolderStructure = (collection, parent) => {
  const ul = createElement('ul', { classes: ['list'] });

  collection.forEach(item => {
    const li = createElement('li', { classes: ['list-option'] });
    const span = createElement('span', { classes: ['option-name'], text: item.title });

    span.addEventListener('contextmenu', (e) => {
      if (e.target && e.target.classList.contains('option-name')) {
        const menu = rootNode.querySelector('.right-menu') || rightMenu(rootNode);
        const renameBtn = menu.querySelector('#rename');
        const deleteBtn = menu.querySelector('#delete');
        const origin = {
          left: e.pageX,
          top: e.pageY
        };

        showRightMenu(e, menu, renameBtn, deleteBtn, origin);
        renameBtn.onclick = () => {
          renameElement(span, item);
        }
        deleteBtn.onclick = () => {
          ul.removeChild(li)
          collection.splice(collection.indexOf(item), 1);
          closeFolder(parent);
          openFolder(collection, parent);
        };
      }
    }, false);
    if (item.folder) {
      createFolder(item, li, span);
    } else {
      createElement('i', { classes: ['material-icons', 'gray'], text: 'insert_drive_file' }, li)
    }
    li.appendChild(span);
    ul.appendChild(li);
  });
  parent.appendChild(ul);
};

const disabledRightMenu = (e) => {
  const menu = rootNode.querySelector('.right-menu') || rightMenu(rootNode);
  if (e.target && !e.target.classList.contains('option-name')) {
    e.preventDefault();
    const origin = {
      left: e.pageX,
      top: e.pageY
    };
    setPosition(menu, origin);
    menu.querySelector('#rename').disabled = true;
    menu.querySelector('#delete').disabled = true;
  }
}

window.addEventListener('contextmenu', e => {
  e.preventDefault();
  disabledRightMenu(e);
})

window.addEventListener('click', () => {
  if (rightMenuVisible) {
    if (focusedOption) {
      focusedOption.classList.remove('focused-option');
    }
    rootNode.removeChild(rootNode.querySelector('.right-menu'));
    rightMenuVisible = false;
  }
}, false);

(function foldreStructure() {
  const structure = createElement('nav', { classes: ['folder-structure'] });

  rootNode.classList.add('root');
  openFolder(data, structure);
  structure.addEventListener('contextmenu', (e) => {
    disabledRightMenu(e);
  }, false);
  rootNode.appendChild(structure);
})();