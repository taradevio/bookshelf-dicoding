function isLocalStorageSupported() {
  if (typeof localStorage !== 'undefined' && localStorage !== null) {
      localStorage.setItem("testKey", "testValue");
      const testValue = localStorage.getItem("testKey");

      if (testValue === "testValue") {
          localStorage.removeItem("testKey");

          return true;
      }
  }

  return false;
}

const unfinishedButton = document.getElementById("unfinished");
unfinishedButton.addEventListener("click", function () {
  const title = document.getElementById("title").value;
  const author = document.getElementById("author").value;
  const year = document.getElementById("year").value;

  if (!title && !author && !year) {
      alert("You haven't inputted any!");
      return;
  }

  function generateId() {
      return +new Date();
  }

  const numYear = parseInt(year, 10);

  if (isNaN(numYear)) {
      alert("Enter a valid number for the year.");
      return;
  }

  const userObj = {
      "id": generateId(),
      "title": title,
      "author": author,
      "year": numYear,
      "isComplete": false
  };

  makeBook(userObj);

  const existingBooks = getStoredBooks();
  existingBooks.push(userObj);
  saveBooks(existingBooks);
});

const completedButton = document.getElementById("completed");
completedButton.addEventListener("click", function () {
  const title = document.getElementById("title").value;
  const author = document.getElementById("author").value;
  const year = document.getElementById("year").value;

  if (!title && !author && !year) {
      alert("You haven't inputted any!");
      return;
  }

  function generateId() {
      return +new Date();
  }

  const numYear = parseInt(year, 10);

  if (isNaN(numYear)) {
      alert("Enter a valid number for the year.");
      return;
  }

  const userObj = {
      "id": generateId(),
      "title": title,
      "author": author,
      "year": numYear,
      "isComplete": true
  };

  completedBook(userObj);

  const existingBooks = getStoredBooks();
  existingBooks.push(userObj);
  saveBooks(existingBooks);
});

function renderBook(containerId, bookObject) {
  const bookTitle = document.createElement("h2");
  bookTitle.innerText = bookObject.title;
  bookTitle.setAttribute("class", "book-title");

  const bookAuthor = document.createElement("p");
  bookAuthor.innerText = bookObject.author;
  bookAuthor.setAttribute("class", "book-author");

  const bookYear = document.createElement("p");
  bookYear.innerText = bookObject.year;

  const btnDelete = document.createElement("button");
  btnDelete.innerText = "Delete";
  btnDelete.setAttribute("class", "delete");
  btnDelete.setAttribute("type", "button");

  const swapButton = createSwapButton(bookObject, containerId);

  const container = document.createElement("div");
  container.setAttribute("class", "book-list");
  container.setAttribute("data-id", bookObject.id);
  container.appendChild(bookTitle);
  container.appendChild(bookAuthor);
  container.appendChild(bookYear);
  container.appendChild(btnDelete);
  container.appendChild(swapButton);

  const div = document.getElementById(containerId);
  div.appendChild(container);

  btnDelete.addEventListener("click", function () {
      container.remove();
      const existingBooks = getStoredBooks();
      const updatedBooks = existingBooks.filter(function (book) {
          return book.id !== bookObject.id;
      });
      saveBooks(updatedBooks);
  });
}

function getStoredBooks() {
  const storedBooks = localStorage.getItem('books');

  if (storedBooks) {
      const parsedBooks = JSON.parse(storedBooks);
      return parsedBooks.map(function (book) {
          return {
              id: book.id,
              title: book.title,
              author: book.author,
              year: book.year,
              isComplete: book.isComplete
          };
      });
  } else {
      return [];
  }
}

function saveBooks(books) {
  localStorage.setItem('books', JSON.stringify(books.map(function (book) {
      return {
          id: book.id,
          title: book.title,
          author: book.author,
          year: book.year,
          isComplete: book.isComplete
      };
  })));
}

function createSwapButton(bookObject, currentContainerId) {
  const swapButton = document.createElement("button");
  swapButton.innerText = "Change";
  swapButton.setAttribute("class", "swap");
  swapButton.setAttribute("type", "button");

  swapButton.addEventListener("click", function () {
      let targetContainerId;
      if (currentContainerId === "container-three") {
          targetContainerId = "container-four";
      } else {
          targetContainerId = "container-three";
      }

      const updatedBookObject = {
          ...bookObject,
          isComplete: targetContainerId === "container-four",
      };

      if (targetContainerId === "container-three") {
          makeBook(updatedBookObject);
      } else if (targetContainerId === "container-four") {
          completedBook(updatedBookObject);
      }

      const existingBooks = getStoredBooks();
      const updatedBooks = existingBooks.map(function (book) {
          if (book.id === bookObject.id) {
              return updatedBookObject;
          } else {
              return book;
          }
      });

      saveBooks(updatedBooks);

      const currentContainer = document.getElementById(currentContainerId);
      const targetContainer = document.getElementById(targetContainerId);

      const bookElement = currentContainer.querySelector('[data-id="' + bookObject.id + '"]');
      bookElement.remove();

      if (!targetContainer.querySelector('[data-id="' + bookObject.id + '"]')) {
          const swapButton = createSwapButton(updatedBookObject, targetContainerId);
          const clonedBook = bookElement.cloneNode(true);
          clonedBook.appendChild(swapButton);
          targetContainer.appendChild(clonedBook);
      }
  });

  return swapButton;
}

function makeBook(bookObject) {
  renderBook("container-three", bookObject);
}

function completedBook(bookObject) {
  renderBook("container-four", bookObject);
}

function renderSearchPreview(searchResults) {
  const searchPreview = document.getElementById("search-preview");
  searchPreview.innerHTML = '';

  if (searchResults.length === 0) {
      const noResultsMessage = document.createElement("p");
      noResultsMessage.innerText = "No matching books found.";
      searchPreview.appendChild(noResultsMessage);
  } else {
      const resultsList = document.createElement("ul");

      searchResults.forEach(function (result) {
          const listItem = document.createElement("li");

          const titleText = document.createTextNode('Title: ' + result.title + ', ');
          const authorText = document.createTextNode('Author: ' + result.author + ', ');

          let containerText;
          if (result.isComplete) {
              containerText = document.createTextNode('In: Completed');
          } else {
              containerText = document.createTextNode('In: Unfinished');
          }

          listItem.appendChild(titleText);
          listItem.appendChild(authorText);
          listItem.appendChild(containerText);

          resultsList.appendChild(listItem);
      });

      searchPreview.appendChild(resultsList);
  }
}

const searchInput = document.getElementById("search");
searchInput.addEventListener("input", function () {
  const searchValue = searchInput.value.trim();
  const filteredBooks = filterBooks(searchValue);

  if (searchValue === '') {
      const searchPreview = document.getElementById("search-preview");
      searchPreview.innerHTML = '';
  } else {
      renderSearchPreview(filteredBooks);
  }
});

function filterBooks(searchInput) {
  const existingBooks = getStoredBooks();
  const filteredBooks = [];

  for (const book of existingBooks) {
      const titleMatches = book.title.toLowerCase().includes(searchInput.toLowerCase());
      const authorMatches = book.author.toLowerCase().includes(searchInput.toLowerCase());

      if (titleMatches || authorMatches) {
          filteredBooks.push({
              title: book.title,
              author: book.author,
              isComplete: book.isComplete,
          });
      }
  }

  return filteredBooks;
}

function renderStoredBooks() {
  const existingBooks = getStoredBooks();
  existingBooks.forEach(book => {
      if (book.isComplete) {
          completedBook(book);
      } else {
          makeBook(book);
      }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  if (isLocalStorageSupported()) {
      renderStoredBooks();
  } else {
      alert('Local storage is not supported in this browser.');
  }
});