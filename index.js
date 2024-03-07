// TODO:
//   - Annotations can have sections. This helps find where you want
//     go in you annotations. Likely done with what are now "comments".
//   - Export sections along with the annotations.
//   - Feature to show what the current NER model would think about the
//     annotation.
//   - Jump to the next annotation without annotations
//   - Reload file button

///////////////////////////////////////////////////////////////////////////////
// INITIAL SETUP
///////////////////////////////////////////////////////////////////////////////
/// an array of strings with all the annotated text
let annotations = [];
/// refers to the current selected annotation
let annotPointer = 0;

/// controls the hovered word effect
let currentHoveredWord = null;

/// the text that's being annotated
const text = document.getElementById("text");
const text_num = document.getElementById("annot-number");

// NOTE: not actually required as index.js is loaded after the DOM.
// It's only purpose it to keep things organised
document.addEventListener("DOMContentLoaded", initialize);

function initialize() {
  // this function sets up the handling for each draggable label
  setupDraggableLabels();

  text.addEventListener("dragenter", handleDragenter);
  text.addEventListener("dragleave", handleDragleave);
  text.addEventListener("drop", handleDrop);
  text.addEventListener("dragover", handleDragover);

  // get the control buttons on the page
  const controlButtons = document
    .querySelector(".buttons")
    .getElementsByTagName("button");
  const prevButton = controlButtons.namedItem("prev");
  //const undoButton = controlButtons.namedItem("undo");
  const clearButton = controlButtons.namedItem("clear");
  //const redoButton = controlButtons.namedItem("redo");
  const nextButton = controlButtons.namedItem("next");

  prevButton.onclick = () => {
    displayAnnotation(annotPointer - 1);
  };
  //undoButton.onclick = undo;
  clearButton.onclick = clearAnnotation;
  //redoButton.onclick = redo;
  nextButton.onclick = () => {
    displayAnnotation(annotPointer + 1);
  };

  // save
  document
    .getElementsByClassName("centered")[0]
    .getElementsByTagName("button")[1].onclick = saveAnnotation;

  // file loading
  document
    .getElementById("file-input")
    .addEventListener("change", readAnnotFile);

  // export button
  document
    .getElementsByClassName("centered")[0]
    .getElementsByTagName("button")[0].onclick = exportAnnotation;
}

function setupDraggableLabels() {
  // our label types
  const labels = ["COMMAND", "OPTION", "INPUT", "NUMBER", "STRING"];

  // https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API
  labels.forEach((label) => {
    const element = document.getElementById(label);
    element.addEventListener("dragstart", function (event) {
      // add the target element's id to the data transfer object
      event.dataTransfer.setData("text/plain", event.target.id);
    });
  });

  // give each label a dragend handle
  const items = document.querySelectorAll(".labels");
  items.forEach((item) => {
    item.addEventListener("dragstart", handleDragstart);
    item.addEventListener("dragend", handleDragend);
  });
}

///////////////////////////////////////////////////////////////////////////////
// DRAGGING SYSTEM
///////////////////////////////////////////////////////////////////////////////
function handleDragstart(event) {
  event.target.style.opacity = 0.4;
}

function handleDragend(event) {
  event.target.style.opacity = 1;
}

function handleDragenter(event) {
  event.preventDefault();
  const target = event.target.closest("span");
  if (!target) return;

  target.classList.add("hovered");
  currentHoveredWord = target;
}

function handleDragleave(event) {
  event.preventDefault();
  const target = event.target.closest("span");

  if (!target) return;

  target.classList.remove("hovered");
  currentHoveredWord = null;
}

// "To ensure that the drop event always fires as expected, you should always
// include a preventDefault() call in the part of your code which handles the
// dragover event."
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/drop_event
function handleDragover(event) {
  event.preventDefault();
}

function handleDrop(event) {
  event.preventDefault();
  const droppedLabel = event.dataTransfer.getData("text/plain");
  const target = event.target.closest("span");

  if (!target) return;

  console.log(`${droppedLabel} dropped on "${target.textContent}"`);

  target.className = droppedLabel.toLowerCase();
}

///////////////////////////////////////////////////////////////////////////////
// ANNOTATION SYSTEM
///////////////////////////////////////////////////////////////////////////////
function displayAnnotation(p) {
  if (p < 0) annotPointer = annotations.length - 1;
  else if (p >= annotations.length) annotPointer = 0;
  else if (p != annotPointer) annotPointer += p > annotPointer ? 1 : -1;

  text_num.textContent = annotPointer + 1;

  // IDEA: Maybe store a seperate history for every annotation. This would
  // allow someone to move around and still have their history saved.
  // reset history
  //history = [];
  //historyPointer = 0;

  text.innerHTML = annotationToHTML(annotations[annotPointer]);
}

function clearAnnotation() {
  Array.from(text.getElementsByTagName("span")).forEach((elem) => {
    elem.className = "";
  });
}

function saveAnnotation() {
  annotations[annotPointer] = HTMLToAnnotation();
}

// TODO: punctuation is seperate from the word itself!
function annotationToHTML(string) {
  // convert annotations to corresponding span
  string = string.replace(
    /\[([^\]]+)]\(([A-Z]+)\)/g,
    function (_, word, className) {
      return word
        .split(" ")
        .map(
          (segment) =>
            `<span class="${className.toLowerCase()}">${segment}</span>`,
        )
        .join(" ");
    },
  );

  // wrap words that aren't already inside a span
  return string
    .split(" ")
    .map((segment) => {
      if (segment.includes("span")) {
        return segment;
      }
      return `<span>${segment}</span>`;
    })
    .join(" ");
}

function HTMLToAnnotation() {
  // NOTE: the issue with this, is that doesn't combine spans of the same class
  // annots = [];
  // Array.from(text.getElementsByTagName("span")).forEach((elem) => {
  //   if (elem.className) {
  //     annots.push(`[${elem.textContent}](${elem.className.toUpperCase()})`);
  //   } else {
  //     annots.push(`${elem.textContent}`);
  //   }
  // });
  // return annots.join(" ");
  let appendBufferToFinalStr = (b, lc) => {
    if (buffer !== "") {
      return lc ? ` [${b}](${lc.toUpperCase()})` : ` ${b}`;
    }
    return "";
  };

  let finalStr = "";
  let lastClass = "";
  let buffer = "";

  Array.from(text.childNodes).forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE && node.tagName === "SPAN") {
      const className = node.className
        .replace("same-class-adjacent", "")
        .replace("last-in-series", "")
        .replace("hovered-word", "")
        .replace(/\s+/g, "")
        .trim();

      if (className) {
        if (lastClass === className || lastClass === "") {
          buffer += (buffer ? " " : "") + node.innerText;
          lastClass = className;
        } else {
          finalStr += appendBufferToFinalStr(buffer, lastClass);
          buffer = node.innerText;
          lastClass = className;
        }
      } else {
        finalStr += appendBufferToFinalStr(buffer, lastClass);
        finalStr += node.innerText;
        buffer = "";
        lastClass = "";
      }
    } else if (node.nodeType === Node.TEXT_NODE) {
      finalStr += appendBufferToFinalStr(buffer, lastClass);
      finalStr += node.nodeValue;
      buffer = "";
      lastClass = "";
    }
  });

  // if we have something in buffer at the end, add it to the final string
  finalStr += appendBufferToFinalStr(buffer, lastClass);
  finalStr = finalStr.trim().replace(/\s+/g, " "); // ensure we don't have consecutive spaces

  // combine adjacent annotations with the same label
  finalStr = finalStr.replace(/\]\(([A-Z]+)\) \[([^\]]+)\]\(\1\)/g, ` $2]($1)`);

  return finalStr;
}

///////////////////////////////////////////////////////////////////////////////
// ANNOT FILE HANDLING
///////////////////////////////////////////////////////////////////////////////

function readAnnotFile(event) {
  var file = event.target.files[0];
  if (!file) return;

  var reader = new FileReader();
  reader.onload = function (event) {
    var contents = event.target.result;
    // load all the annotations from the file
    loadContents(contents);
    // display the annotation at annotPointer
    displayAnnotation(annotPointer);
    // make sure the annotator is shown
    document.getElementById("annotator").classList.remove("hidden");
  };
  reader.readAsText(file);
}

function loadContents(contents) {
  annotations.length = 0;

  const lines = contents.split("\n");

  lines.forEach((line) => {
    if (line && !line.startsWith("-") && !line.startsWith("/")) {
      annotations.push(line);
    }
  });

  console.log(annotations);
}

function exportAnnotation() {
  const file = new File([annotations.join("\n")], "annot.txt", {
    type: "text/plain",
  });

  const link = document.createElement("a");
  const url = URL.createObjectURL(file);

  link.href = url;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
