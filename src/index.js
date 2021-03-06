const main = document.querySelector('main');
const bookmarks = bookmarksFunctions();     // меню закладок
const noimg = './placeholder.png';
const bookmarkMenu = document.querySelector('.bookmark-menu');

const mainSection = document.querySelector('#parent'); // элемент, в котором рендерится весь контент
mainSection.addEventListener('click', event => {
  if (!event.target.closest('.card') &&            // если клик был не по карточке или заголовку статьи - игнорируем
  !event.target.closest('.article-header')) return; 
  if (event.target.parentElement instanceof HTMLButtonElement) {
    bookmarks.btnEventHandler(event.target);       // отдельный обработчик клика по кнопке закладки
  } else {
    fetchHandler(event);                           // запрос статьи у telegra.ph API
  }
})

bookmarkMenu.addEventListener('click', event => {
  console.log(event)
  if (!event.target.closest('.bookmark')) return;  // если клик был не по телу закладки - игнорируем
  if (event.target.parentElement instanceof HTMLButtonElement) {
    bookmarks.btnEventHandler(event.target)
  } else {
    fetchHandler(event);
  }
})
const logo = document.querySelector('.logo');
logo.addEventListener('click', clearPage);        // клик по лого - очищает страницу

const fetchInput = document.querySelector('#fetchInput');
fetchInput.addEventListener('submit', fetchHandler);

const googleInput = document.querySelector('#googleInput');
googleInput.addEventListener('submit', searchHandler);

// Обработка ответа Telegra.ph API. Структура ответа - в console.log
function renderArticle({
    result: {
      author_name: author,
      description: snippet,
      url: link,
      image_url: img,
      content,
      title
    }
  }) {
  const article = document.createElement('article');
  article.append(renderArticleHeader(author, title, img, link, snippet));
  content.forEach(elem => {
    article.append(renderArticleContent(elem));
  });
  mainSection.append(article)
}

function renderArticleHeader(author, title, img, link, snippet) {
  const header = document.createElement('header');
  header.className = "article-header"
  header.dataset.img = img;
  header.dataset.link = link.toLowerCase();
  header.dataset.title = title;
  header.dataset.snippet = snippet;

  const headerBookmarkBtn = bookmarks.renderBookmarkBtn()
  if (bookmarks.duplicateCheck(header.dataset.link)) {
    headerBookmarkBtn.classList.toggle('marked');
  }

  const headerTitle = document.createElement('h3');
  headerTitle.textContent = title;

  const p = document.createElement('p');
  p.textContent = author;

  header.append(headerBookmarkBtn, headerTitle, p);
  return header;
}

function renderArticleContent ({ tag, children = [], attrs }) { //рекурсивная функция
  return children.reduce((acc, curr) => {
    if (attrs) {
      for (let key in attrs) {
        acc.setAttribute(key, attrs[key]);
      }
    }

    if (typeof curr === 'string') {
      acc.append(document.createTextNode(curr));
    } else {
      if (curr.children) {
        acc.append(renderArticleContent(curr));
      } else {
        let temp = document.createElement(curr.tag);
        for (let key in curr.attrs) {
          if (curr.attrs[key].startsWith("/")) {
            temp.setAttribute(key, `https://telegra.ph${curr.attrs[key]}`);
          } else {
            temp.setAttribute(key, curr.attrs[key]);
          }
        };
        acc.append(temp);
      };
    }
    return acc;
  }, document.createElement(tag));
}

/* асинхронные функции */
async function fetchHandler(event) {  // fetch Telegra.ph API, по итогу рендерит статью
  event.preventDefault();

  let fetchTargetPage;  // источник ссылки на статью зависит от вида кликнутого элемента
  if (event.target instanceof HTMLFormElement) {
    fetchTargetPage = document.querySelector('#fetchValue').value.toLowerCase();
  } else if (event.target.closest('.card')) {
    fetchTargetPage = event.target.closest('.card').dataset.link.toLowerCase();
  } else {
    fetchTargetPage = event.target.closest('.bookmark').dataset.link.toLowerCase();
  }

  const spinner = renderSpinner();
  main.append(spinner);

  if(!mainSection.classList.contains('article-container')) {
    mainSection.className = 'article-container';
  } // класс mainSection зависит от типа рендерящегося контента
  clearPage();
  try {
    const fetchResult = await fetch(`https://api.telegra.ph/getPage/${fetchTargetPage.slice(19)}?return_content=true`);
    const response = await fetchResult.json();
    console.log(response);
    renderArticle(response);
  } catch (err) {
    console.error(err)
  }
  spinner.remove()
}



async function searchHandler(event) { // fetch Google Custom Search API
  const spinner = renderSpinner();    // по итогу рендерит результаты поиска в виде карточек
  main.append(spinner);
  const searchQuery = document.querySelector('#googleValue').value;
  let start = 1;
  let btn;
  event.preventDefault();
  try {
    const searchResult = await fetch(`https://www.googleapis.com/customsearch/v1?key=AIzaSyBit3zVmXZThAxAnPT_j8qBnrQgRN_IrRg&cx=0d7cbe59cd07cfd30&q=${searchQuery}&start=${start}`);
    const response = await searchResult.json();
    console.log(response);
    if(!response.items) {   // если в ответе отсутствует массив items - ничего не найдено
      throw new Error('Google Search API Error');
    }
    if(!mainSection.classList.contains('row')){
      mainSection.className = 'row row-cols-1 row-cols-xxl-4 row-cols-xl-3 row-cols-lg-3 row-cols-md-2 row-cols-sm-1';
    }

    clearPage();
    renderCardList(response);

    btn = renderLoadmoreBtn(); // кнопка подгрузки новых результатов
    btn.addEventListener('click', loadMoreResults);

    start += 10;
  } catch(err) {
    console.error(err);
  }
  spinner.remove()
  async function loadMoreResults(event) {
    try {
      const searchResult = await fetch(`https://www.googleapis.com/customsearch/v1?key=AIzaSyBit3zVmXZThAxAnPT_j8qBnrQgRN_IrRg&cx=0d7cbe59cd07cfd30&q=${searchQuery}&start=${start}`);
      const response = await searchResult.json();
      renderCardList(response);          // рендер списка статей в виде карточек.
      start += 10;
    } catch (err) {
      console.error(err);
    }
  }
}

// функции для рендера ответов Google Custom Search API
function renderCardList({ items }) {
  items.forEach(elem => {
    mainSection.append(renderCard(elem));
  });
}

function renderCard({
  link,
  title = 'no title',
  snippet,
  pagemap: {
    cse_thumbnail: [{ 
      src: imgThumbnail
    } = {}] = [],
    cse_image: [{ 
      src: img
    } = {}] = []
  }
}) {
  title = `${title.slice(0, title.length - 11)}`; // Отсекает "– Telegraph" в конце каждого заголовка
  const cardCol = document.createElement('div');
  cardCol.className = 'col mt-2 mb-3';
  
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.link = link.toLowerCase();
  card.dataset.title = title;
  card.dataset.snippet = snippet;
  card.dataset.img = imgThumbnail || img || noimg;
  
  const cardImgContainer = document.createElement('div');
  cardImgContainer.className = 'img-container';
  
  const cardImg = document.createElement('img');
  cardImg.src = imgThumbnail || img || noimg;
  cardImg.className = "card-img-top";
  
  const cardBody = document.createElement('div');
  cardBody.className = 'card-body';
  
  const cardText = document.createElement('p');
  cardText.className = 'card-text';
  cardText.textContent = snippet;
  
  const cardTitle = document.createElement('h5');
  cardTitle.textContent = title;
  
  const cardBookmarkBtn = bookmarks.renderBookmarkBtn();
  if (bookmarks.duplicateCheck(card.dataset.link)) {
    cardBookmarkBtn.classList.toggle('marked');
  }

  cardImgContainer.append(cardImg);
  cardBody.append(cardTitle, cardText);
  card.append(cardBookmarkBtn ,cardImgContainer, cardBody);
  cardCol.append(card);
  
  return cardCol;
}

function renderLoadmoreBtn() {
  const btn = document.createElement('button');
  btn.setAttribute('id', 'loadmore');
  btn.textContent = 'Load more results';

  main.append(btn)
  return btn;
}

function renderSpinner() {
  const spinner = document.createElement('div');
  spinner.className = 'spinner-grow text-light';

  return spinner;
}

function clearPage() {
  const btn = document.querySelector('#loadmore');
  if (btn) {
    btn.remove()
  }
  mainSection.innerHTML = '';
}

// Функционал меню закладок
function bookmarksFunctions() {
  let bookmarksArray = [];
  let functions = {
    addBookmark,
    deleteBookmark,
    logArray,
    clearBookmarks,
    renderBookmarkBtn,
    btnEventHandler,
    duplicateCheck
  }
  return functions;

  /* публичные функции */
  function addBookmark(img, link, title, snippet) {
    bookmarksArray.push({
      img: img,
      link: link,
      title: title,
      snippet: snippet
    });
    renderBookmarkList();
  }
  function deleteBookmark(link) {
    bookmarksArray = bookmarksArray.filter(elem => {
      return !(elem.link === link)
    });
    renderBookmarkList();
  }
  function logArray() {                 //метод для дебага
    bookmarksArray.forEach(elem => {
      console.log(elem)
    })
  }
  function clearBookmarks() {
    bookmarksArray = [];
    renderBookmarkList();
  }
  function renderBookmarkBtn(marked) {
    const btn = document.createElement('button');
    btn.className = `bookmark-btn ${marked ? 'marked' : ''}`;
    btn.innerHTML = '<i class="fas fa-bookmark"></i>';
    return btn;
  }

  function btnEventHandler({ 
    parentElement: {
      classList,
      parentElement: {
        dataset: {
          img,
          link,
          title,
          snippet
        }
      }
    } 
  }) {
    if (classList.contains('marked')) {
      classList.toggle('marked');
      deleteBookmark(link);
    } else if (!duplicateCheck(link)) {
      classList.toggle('marked');
      addBookmark(img, link, title, snippet);
      return;
    }
  }
  function duplicateCheck(link) {
    return bookmarksArray.some(elem => {
      return elem.link === link;
    });
  }
  /* конец публичных функций */

  /* служебные/приватные функции */
  function renderBookmarkList() {
    bookmarkMenu.innerHTML = '';
    bookmarksArray.forEach(elem => {
      renderBookmark(elem);
    })
  }

  function renderBookmark({ img, link, title, snippet }) {
    const bookmarkContainer = document.createElement('div');
    bookmarkContainer.className = 'row bookmark g-0';
    bookmarkContainer.dataset.link = link;

    const bookmarkBtn = renderBookmarkBtn(true);

    const bookmarkImgBox = document.createElement('div');
    bookmarkImgBox.className = 'col-4'

    const bookmarkImg = document.createElement('img');
    bookmarkImg.src = img;

    const bookmarkTextBox = document.createElement('div');
    bookmarkTextBox.className = 'bookmark-text col-8';

    const bookmarkTitle = document.createElement('h5');
    const bookmarkText = document.createElement('p');
    bookmarkTitle.textContent = title;
    bookmarkText.textContent = snippet;
  
    bookmarkImgBox.append(bookmarkImg);
    bookmarkTextBox.append(bookmarkBtn, bookmarkTitle, bookmarkText);
    bookmarkContainer.append(bookmarkImgBox, bookmarkTextBox);
    bookmarkMenu.append(bookmarkContainer);
  }
  /* конец служебных/приватных функций */
}

if (document.documentElement.clientWidth < 1024) {
  main.className = 'col-12';
} // костыль напоследок, меняю класс контейнеру контента в зависимости от ширины экрана, чтобы на мобилках выглядело хорошо.