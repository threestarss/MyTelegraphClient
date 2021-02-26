const mainSection = document.getElementById('posts-container');
const favPagesArray = [];
/*makePage принимает объект page(), обращается к свойству result и вытаскивает оттуда массив объектов content, он содержит DOM-структуру статьи.
Объекты в массиве content в документации называются Node, они содержат данные, используя которые можно собрать DOM элемент(https://telegra.ph/api#Node). Имеют следующий вид:
{
  tag: string,
  children: []
  attrs: {} (может отсутствовать)
}
tag - название HTML-тега
Массив children хранит всех детей DOM-элемента. Элементы массива могут быть как строкой, так и Node-элементом. 

В документации API уже есть хорошая функция, которая может перевести массив Node'ов в DOM-структуру, и следует использовать её.
Но, чтобы показать, что я могу реализовать нужную функцию самостоятельно, сделал тоже самое, но с reduce. Это не очень хорошее решение,
оно привело к проблеме, решение которой я описал ниже в коде.*/
function makePage(page) {
  let content = page.result.content;
  content.forEach(elem => {
    mainSection.append(makeDomObj(elem));
  })
  function makeDomObj ({ tag, children = [], attrs }) {
    return children.reduce((acc, curr) => {
      if (attrs) {                                     // Проверяем, есть ли у Node атрибуты. Если да - сразу же их вставляем в 
        for (let key in attrs) {                       // DOM-элемент
          acc.setAttribute(key, attrs[key]);
        }
      }

      if (typeof curr === 'string') {                  // Если элемент обычный текст, то просто помещаем его внутрь тега.
        acc.innerHTML += curr;
      } else {
        if (curr.children) {                           // Если у DOM-элемента есть дети - делаем рекурсивный вызов makeDomObj.
          acc.append(makeDomObj(curr));
        } else {                                       // Та проблема, с которой я столкнулся:
          let temp = document.createElement(curr.tag); // Если у DOM-элемента нет детей, то это одиночный тэг. В таком случае рекурсив-
          for (let key in curr.attrs) {                // ный вызов просто несработает. Приходится создавать элемент вручную.
            if (curr.attrs[key].startsWith("/")) {
              temp.setAttribute(key, `https://telegra.ph${curr.attrs[key]}`); // Если картинка залита на сам телеграф, то API отдаёт
            } else {                                                          // ссылку в виде /path.png, поэтому приходится 
              temp.setAttribute(key, curr.attrs[key]);                        // дописывать url таким образом.
            }
          };
          acc.append(temp);
        };
      }
      return acc;
    }, document.createElement(tag));
  }
}

async function fetchHandler() {
  const fetchTargetPage = document.getElementsByName('fetchBox')[0].value;
  const response = await fetch(`https://api.telegra.ph/getPage/${fetchTargetPage.slice(19)}?return_content=true`);
  const newResponse = await response.json();
  console.log(newResponse);
  makePage(newResponse);
}
async function authorSearchHandler() {
  clearPage();
  const searchQuery = document.getElementsByName('googleBox')[0].value;
  const searchTest = await fetch(`https://www.googleapis.com/customsearch/v1?key=AIzaSyBit3zVmXZThAxAnPT_j8qBnrQgRN_IrRg&cx=0d7cbe59cd07cfd30&q=${searchQuery}`);
  const response = await searchTest.json();
  console.log(response);
  makeListOfPages(response);
}
function clearPage() {
  mainSection.innerHTML = '';
}
function descriptionMaker(page) {
  mainSection.innerHTML = page.result.description;
}
function makeListOfPages({ items }) {
  items.forEach(elem => {
    console.log(elem);
    makePageCard(elem);
  })
}
function makePageCard( {
  htmlFormattedUrl: url,
  htmlTitle: title,
  pagemap: {
    cse_thumbnail: [
      { src: imgThumbnail }
    ],
    cse_image: [
      { src: img }
    ]
  }
} ){
  const card = document.createElement('div');
  const cardTitle = document.createElement('h3');
  const cardText = document.createElement('p');
  const cardUrl = document.createElement('a');
  cardUrl.href = url;
  cardUrl.innerHTML = url;
  cardTitle.innerHTML = title;
  card.className = 'card';
  cardText.append(cardUrl);
  const cardThumbnail = document.createElement('img');
  cardThumbnail.src = imgThumbnail;
  card.append(cardThumbnail, cardTitle, cardText);
  mainSection.append(card);
}