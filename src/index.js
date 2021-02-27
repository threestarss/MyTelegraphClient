const mainSection = document.getElementById('parent');
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
async function searchHandler() {
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
    mainSection.append(makePageCard(elem));
  })
}

function makePageCard( {
  link,
  title = 'no title',
  pagemap: {
    cse_thumbnail: [
      { src: imgThumbnail } = {}
    ] = [],
    cse_image: [
      { src: img } = {}
    ] = []
  }
} ) {
  const card = document.createElement('div');
  const cardTitle = document.createElement('h5');
  const cardText = document.createElement('p');
  const cardUrl = document.createElement('a');
  const cardBody = document.createElement('div');
  const cardCol = document.createElement('div');
  cardCol.className = 'col'
  cardBody.className = 'card-body';
  cardUrl.href = link;
  cardUrl.innerHTML = link;
  cardTitle.innerHTML = title;
  card.className = 'card';
  cardText.append(cardUrl);
  const cardThumbnail = document.createElement('img');
  cardThumbnail.src = imgThumbnail || img || 'no-img';
  cardThumbnail.className = "card-img-top ";
  cardBody.append(cardTitle, cardText);
  card.append(cardThumbnail, cardBody);
  cardCol.append(card);
  return cardCol;
}
function fakeGoogleAPIResponse(response) {
  makeListOfPages(response);
}
const googleAPIResponse = {
  "kind": "customsearch#search",
  "url": {
    "type": "application/json",
    "template": "https://www.googleapis.com/customsearch/v1?q={searchTerms}&num={count?}&start={startIndex?}&lr={language?}&safe={safe?}&cx={cx?}&sort={sort?}&filter={filter?}&gl={gl?}&cr={cr?}&googlehost={googleHost?}&c2coff={disableCnTwTranslation?}&hq={hq?}&hl={hl?}&siteSearch={siteSearch?}&siteSearchFilter={siteSearchFilter?}&exactTerms={exactTerms?}&excludeTerms={excludeTerms?}&linkSite={linkSite?}&orTerms={orTerms?}&relatedSite={relatedSite?}&dateRestrict={dateRestrict?}&lowRange={lowRange?}&highRange={highRange?}&searchType={searchType}&fileType={fileType?}&rights={rights?}&imgSize={imgSize?}&imgType={imgType?}&imgColorType={imgColorType?}&imgDominantColor={imgDominantColor?}&alt=json"
  },
  "queries": {
    "request": [
      {
        "title": "Google Custom Search - strange",
        "totalResults": "8930",
        "searchTerms": "strange",
        "count": 10,
        "startIndex": 1,
        "inputEncoding": "utf8",
        "outputEncoding": "utf8",
        "safe": "off",
        "cx": "0d7cbe59cd07cfd30"
      }
    ],
    "nextPage": [
      {
        "title": "Google Custom Search - strange",
        "totalResults": "8930",
        "searchTerms": "strange",
        "count": 10,
        "startIndex": 11,
        "inputEncoding": "utf8",
        "outputEncoding": "utf8",
        "safe": "off",
        "cx": "0d7cbe59cd07cfd30"
      }
    ]
  },
  "context": {
    "title": "MyTelegraphClient"
  },
  "searchInformation": {
    "searchTime": 0.303048,
    "formattedSearchTime": "0.30",
    "totalResults": "8930",
    "formattedTotalResults": "8,930"
  },
  "items": [
    {
      "kind": "customsearch#result",
      "title": "A STRANGE MAN ESSAY FORMAT – Telegraph",
      "htmlTitle": "A <b>STRANGE</b> MAN ESSAY FORMAT – Telegraph",
      "link": "https://telegra.ph/A-STRANGE-MAN-ESSAY-FORMAT-08-29",
      "displayLink": "telegra.ph",
      "snippet": "Aug 29, 2018 ... A STRANGE MAN ESSAY FORMAT. Jeffery Graff. Bosscat review of literature \nWinthrop heather orourke traffic reporter ny osu shooting report ...",
      "htmlSnippet": "Aug 29, 2018 <b>...</b> A <b>STRANGE</b> MAN ESSAY FORMAT. Jeffery Graff. Bosscat review of literature <br>\nWinthrop heather orourke traffic reporter ny osu shooting report&nbsp;...",
      "cacheId": "3w1yQrg7HJkJ",
      "formattedUrl": "https://telegra.ph/A-STRANGE-MAN-ESSAY-FORMAT-08-29",
      "htmlFormattedUrl": "https://telegra.ph/A-<b>STRANGE</b>-MAN-ESSAY-FORMAT-08-29",
      "pagemap": {
        "cse_thumbnail": [
          {
            "src": "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcQZSehVcgpV8Jd1JztpdQCQHE6VvDTw-94zT-vgWd6XvFY-t542I6ttlCU",
            "width": "300",
            "height": "168"
          }
        ],
        "metatags": [
          {
            "og:type": "article",
            "article:published_time": "2018-08-29T16:07:16+0000",
            "twitter:card": "summary",
            "twitter:title": "A STRANGE MAN ESSAY FORMAT",
            "og:site_name": "Telegraph",
            "handheldfriendly": "True",
            "og:title": "A STRANGE MAN ESSAY FORMAT",
            "og:description": "Bosscat review of literature Winthrop heather orourke traffic reporter ny osu shooting report look. W 182nd Street zip 10033 bosscat review of literature Hubert Street zip 10013 dialogue writing between two friends on new syllabus for matric college lab report example physics equations Moline. Bosscat review of literature pcat essay tips for examination Marist College, Poughkeepsie car market value valuation report Madison what does it mean to suggest that report writing is interactive bosscat review of literature…",
            "article:author": "Jeffery Graff",
            "article:modified_time": "2018-08-29T16:07:16+0000",
            "viewport": "width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no",
            "twitter:description": "Bosscat review of literature Winthrop heather orourke traffic reporter ny osu shooting report look. W 182nd Street zip 10033 bosscat review of literature Hubert Street zip 10013 dialogue writing between two friends on new syllabus for matric college lab report example physics equations Moline. Bosscat review of literature pcat essay tips for examination Marist College, Poughkeepsie car market value valuation report Madison what does it mean to suggest that report writing is interactive bosscat review of literature…",
            "mobileoptimized": "176",
            "format-detection": "telephone=no"
          }
        ],
        "cse_image": [
          {
            "src": "https://telegra.ph/file/7de67083fac29cb68fda5.jpg"
          }
        ]
      }
    },
    {
      "kind": "customsearch#result",
      "title": "Pulp Classics. Strange Tales #4 (March 1932) – Telegraph",
      "htmlTitle": "Pulp Classics. <b>Strange</b> Tales #4 (March 1932) – Telegraph",
      "link": "https://telegra.ph/Pulp-Classics-Strange-Tales-4-March-1932-08-08",
      "displayLink": "telegra.ph",
      "snippet": "Aug 7, 2019 ... Had the Great Depression not intervened and killed it after seven issues, the \nwhole history of fantastic fiction might have been different. Strange ...",
      "htmlSnippet": "Aug 7, 2019 <b>...</b> Had the Great Depression not intervened and killed it after seven issues, the <br>\nwhole history of fantastic fiction might have been different. <b>Strange</b>&nbsp;...",
      "cacheId": "8DxrxgRjGpkJ",
      "formattedUrl": "https://telegra.ph/Pulp-Classics-Strange-Tales-4-March-1932-08-08",
      "htmlFormattedUrl": "https://telegra.ph/Pulp-Classics-<b>Strange</b>-Tales-4-March-1932-08-08",
      "pagemap": {
        "cse_thumbnail": [
          {
            "src": "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcTtwQH7cLidHUNWGj7UG0KrDYUoeJ2ghEpJ0GabTwZpvuRUT0GxFtmp-0MY",
            "width": "188",
            "height": "268"
          }
        ],
        "metatags": [
          {
            "og:image": "https://cdn1.ozone.ru/multimedia/1035864431.jpg",
            "og:type": "article",
            "article:published_time": "2019-08-08T05:10:01+0000",
            "twitter:card": "summary",
            "twitter:title": "Pulp Classics. Strange Tales #4 (March 1932)",
            "og:site_name": "Telegraph",
            "handheldfriendly": "True",
            "og:title": "Pulp Classics. Strange Tales #4 (March 1932)",
            "og:description": "🌐🌐🌐 STRANGE TALES OF MYSTERY AND TERROR . . .When Strange Tales first appeared in 1931 as a pulp magazine, it was clearly something new. Edited by Harry Bates as a companion to Astounding Stories, it combined the supernatural horror and fantasy of Weird Tales with vigorous action plots. Had the Great Depression not intervened and killed it after seven issues, the whole history of fantastic fiction might have been different. Strange Tales rapidly attracted the most imaginative and capable writers of the day…",
            "twitter:image": "https://cdn1.ozone.ru/multimedia/1035864431.jpg",
            "article:modified_time": "2019-09-10T04:55:15+0000",
            "viewport": "width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no",
            "twitter:description": "🌐🌐🌐 STRANGE TALES OF MYSTERY AND TERROR . . .When Strange Tales first appeared in 1931 as a pulp magazine, it was clearly something new. Edited by Harry Bates as a companion to Astounding Stories, it combined the supernatural horror and fantasy of Weird Tales with vigorous action plots. Had the Great Depression not intervened and killed it after seven issues, the whole history of fantastic fiction might have been different. Strange Tales rapidly attracted the most imaginative and capable writers of the day…",
            "mobileoptimized": "176",
            "format-detection": "telephone=no"
          }
        ],
        "cse_image": [
          {
            "src": "https://cdn1.ozone.ru/multimedia/1035864431.jpg"
          }
        ]
      }
    },
    {
      "kind": "customsearch#result",
      "title": "Strange Nature (2018) – Telegraph",
      "htmlTitle": "<b>Strange</b> Nature (2018) – Telegraph",
      "link": "https://telegra.ph/Strange-Nature-2018-10-03",
      "displayLink": "telegra.ph",
      "snippet": "Oct 3, 2018 ... Storyline: The first film to expose unsolved wildlife deformity outbreaks and where \nthey may lead. Strange Nature (2018) 720p WEB-DL 800MB.",
      "htmlSnippet": "Oct 3, 2018 <b>...</b> Storyline: The first film to expose unsolved wildlife deformity outbreaks and where <br>\nthey may lead. <b>Strange</b> Nature (2018) 720p WEB-DL 800MB.",
      "cacheId": "B6EAG8OPW6wJ",
      "formattedUrl": "https://telegra.ph/Strange-Nature-2018-10-03",
      "htmlFormattedUrl": "https://telegra.ph/<b>Strange</b>-Nature-2018-10-03",
      "pagemap": {
        "metatags": [
          {
            "og:image": "https://keepimg.com/images/A8nW.jpg",
            "og:type": "article",
            "article:published_time": "2018-10-03T18:52:47+0000",
            "twitter:card": "summary",
            "twitter:title": "Strange Nature (2018)",
            "og:site_name": "Telegraph",
            "handheldfriendly": "True",
            "og:title": "Strange Nature (2018)",
            "og:description": "Storyline: The first film to expose unsolved wildlife deformity outbreaks and where they may lead.\n\nStrange Nature (2018) 720p WEB-DL 800MB\nhttps://openload.co/f/BlviYsyeiMI/\nhttps://uptobox.com/tbzp0fsrzdps\nhttps://userscloud.com/ansld0j5eebk\nhttps://mirrorace.com/m/3uErp\nhttps://racaty.com/c49dvelajxsw\nhttps://1fichier.com/?77y62oxl5lhi0rtd5q0u\nhttp://multiup.org/583ca3d0e14e9a60aa6ba7cef7cb7ebc",
            "twitter:image": "https://keepimg.com/images/A8nW.jpg",
            "article:modified_time": "2018-10-03T18:52:47+0000",
            "viewport": "width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no",
            "twitter:description": "Storyline: The first film to expose unsolved wildlife deformity outbreaks and where they may lead.\n\nStrange Nature (2018) 720p WEB-DL 800MB\nhttps://openload.co/f/BlviYsyeiMI/\nhttps://uptobox.com/tbzp0fsrzdps\nhttps://userscloud.com/ansld0j5eebk\nhttps://mirrorace.com/m/3uErp\nhttps://racaty.com/c49dvelajxsw\nhttps://1fichier.com/?77y62oxl5lhi0rtd5q0u\nhttp://multiup.org/583ca3d0e14e9a60aa6ba7cef7cb7ebc",
            "mobileoptimized": "176",
            "format-detection": "telephone=no"
          }
        ],
        "cse_image": [
          {
            "src": "https://keepimg.com/images/A8nW.jpg"
          }
        ]
      }
    },
    {
      "kind": "customsearch#result",
      "title": "The strange death of europe immigration, identity, islam – Telegraph",
      "htmlTitle": "The <b>strange</b> death of europe immigration, identity, islam – Telegraph",
      "link": "https://telegra.ph/The-strange-death-of-europe-immigration-identity-islam-03-03",
      "displayLink": "telegra.ph",
      "snippet": "Mar 3, 2018 ... Order the strange death europe now Order the strange death europe now. One \ncogent summary how over three decades more elites across ...",
      "htmlSnippet": "Mar 3, 2018 <b>...</b> Order the <b>strange</b> death europe now Order the <b>strange</b> death europe now. One <br>\ncogent summary how over three decades more elites across&nbsp;...",
      "cacheId": "3HnvG-K6sP0J",
      "formattedUrl": "https://telegra.ph/The-strange-death-of-europe-immigration-identity-islam-03 -03",
      "htmlFormattedUrl": "https://telegra.ph/The-<b>strange</b>-death-of-europe-immigration-identity-islam-03 -03",
      "pagemap": {
        "metatags": [
          {
            "og:type": "article",
            "article:published_time": "2018-03-03T17:12:56+0000",
            "twitter:card": "summary",
            "twitter:title": "The strange death of europe immigration, identity, islam",
            "og:site_name": "Telegraph",
            "handheldfriendly": "True",
            "og:title": "The strange death of europe immigration, identity, islam",
            "og:description": "========================\nthe strange death of europe immigration, identity, islam    \nthe-strange-death-of-europe-immigration,-identity,-islam    \n========================    \n\n    \n\n    \n    \n    \n    \n    \n    \n    \n    \n    \n    \n    \n    \n    \n    \n    \n    \n    \n    \n    \n    \n    \n. The strange death europe immigration identity islam douglas murray bloomsbury continuum 2017 finished reading douglas murrays the strange death europe. Order the strange death europe now Order the strange death europe now.…",
            "article:modified_time": "2018-03-03T17:12:56+0000",
            "viewport": "width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no",
            "twitter:description": "========================\nthe strange death of europe immigration, identity, islam    \nthe-strange-death-of-europe-immigration,-identity,-islam    \n========================    \n\n    \n\n    \n    \n    \n    \n    \n    \n    \n    \n    \n    \n    \n    \n    \n    \n    \n    \n    \n    \n    \n    \n    \n. The strange death europe immigration identity islam douglas murray bloomsbury continuum 2017 finished reading douglas murrays the strange death europe. Order the strange death europe now Order the strange death europe now.…",
            "mobileoptimized": "176",
            "format-detection": "telephone=no"
          }
        ]
      }
    },
    {
      "kind": "customsearch#result",
      "title": "A Strange Manuscript Found in a Copper Cylinder – Telegraph",
      "htmlTitle": "A <b>Strange</b> Manuscript Found in a Copper Cylinder – Telegraph",
      "link": "https://telegra.ph/A-Strange-Manuscript-Found-in-a-Copper-Cylinder-07-28",
      "displayLink": "telegra.ph",
      "snippet": "Jul 28, 2019 ... The creators of this series are united by passion for literature and driven by the \nintention of making all public domain books available in printed ...",
      "htmlSnippet": "Jul 28, 2019 <b>...</b> The creators of this series are united by passion for literature and driven by the <br>\nintention of making all public domain books available in printed&nbsp;...",
      "cacheId": "_8j23P2Sbt4J",
      "formattedUrl": "https://telegra.ph/A-Strange-Manuscript-Found-in-a-Copper-Cylinder-07-28",
      "htmlFormattedUrl": "https://telegra.ph/A-<b>Strange</b>-Manuscript-Found-in-a-Copper-Cylinder-07-28",
      "pagemap": {
        "cse_thumbnail": [
          {
            "src": "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcSlCrq8bSPiCELlt_wVqloOidlFGbhP7tvRDQAVavhdbsE_ly_Kcuwt4HiN",
            "width": "181",
            "height": "279"
          }
        ],
        "metatags": [
          {
            "og:image": "https://cdn1.ozone.ru/multimedia/1032323995.jpg",
            "og:type": "article",
            "article:published_time": "2019-07-28T12:01:01+0000",
            "twitter:card": "summary",
            "twitter:title": "A Strange Manuscript Found in a Copper Cylinder",
            "og:site_name": "Telegraph",
            "handheldfriendly": "True",
            "og:title": "A Strange Manuscript Found in a Copper Cylinder",
            "og:description": "🌐🌐🌐 This book is part of the TREDITION CLASSICS series. The creators of this series are united by passion for literature and driven by the intention of making all public domain books available in printed format again - worldwide. At tredition we believe that a great book never goes out of style. Several mostly non-profit literature projects provide content to tredition. To support their good work, tredition donates a portion of the proceeds from each sold copy. As a reader of a TREDITION CLASSICS book, you…",
            "article:author": "James De Mille",
            "twitter:image": "https://cdn1.ozone.ru/multimedia/1032323995.jpg",
            "article:modified_time": "2019-09-09T09:57:03+0000",
            "viewport": "width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no",
            "twitter:description": "🌐🌐🌐 This book is part of the TREDITION CLASSICS series. The creators of this series are united by passion for literature and driven by the intention of making all public domain books available in printed format again - worldwide. At tredition we believe that a great book never goes out of style. Several mostly non-profit literature projects provide content to tredition. To support their good work, tredition donates a portion of the proceeds from each sold copy. As a reader of a TREDITION CLASSICS book, you…",
            "mobileoptimized": "176",
            "format-detection": "telephone=no"
          }
        ],
        "cse_image": [
          {
            "src": "https://cdn1.ozone.ru/multimedia/1032323995.jpg"
          }
        ]
      }
    },
    {
      "kind": "customsearch#result",
      "title": "Where the Strange Trails go Down; Sulu, Borneo, Celebes, Bali ...",
      "htmlTitle": "Where the <b>Strange</b> Trails go Down; Sulu, Borneo, Celebes, Bali ...",
      "link": "https://telegra.ph/Where-the-Strange-Trails-go-Down-Sulu-Borneo-Celebes-Bali-Java-Sumatra-Straits-Settlements-Malay-States-Siam-Cambodia-Annam-Coch-08-26",
      "displayLink": "telegra.ph",
      "snippet": "Aug 26, 2019 ... Where the Strange Trails go Down; Sulu, Borneo, Celebes, Bali, Java, Sumatra, \nStraits Settlements, Malay States, Siam, Cambodia, Annam, ...",
      "htmlSnippet": "Aug 26, 2019 <b>...</b> Where the <b>Strange</b> Trails go Down; Sulu, Borneo, Celebes, Bali, Java, Sumatra, <br>\nStraits Settlements, Malay States, Siam, Cambodia, Annam,&nbsp;...",
      "cacheId": "6-GI2IEL-bAJ",
      "formattedUrl": "https://telegra.ph/Where-the-Strange-Trails-go-Down-Sulu-Borneo-Celebes- Bali-Java-Sumatra-Straits-Settlements-Malay-States-Siam-Cambodia-Annam...",
      "htmlFormattedUrl": "https://telegra.ph/Where-the-<b>Strange</b>-Trails-go-Down-Sulu-Borneo-Celebes- Bali-Java-Sumatra-Straits-Settlements-Malay-States-Siam-Cambodia-Annam...",
      "pagemap": {
        "cse_thumbnail": [
          {
            "src": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdtS8PIlPZwXfclT_BCjgHJjl7us8LYBIKeEYDzJFl8zlZfqdmIhasIRc",
            "width": "183",
            "height": "275"
          }
        ],
        "metatags": [
          {
            "og:image": "https://cdn1.ozone.ru/multimedia/1030461496.jpg",
            "og:type": "article",
            "article:published_time": "2019-08-26T20:48:01+0000",
            "twitter:card": "summary",
            "twitter:title": "Where the Strange Trails go Down; Sulu, Borneo, Celebes, Bali, Java, Sumatra, Straits Settlements, Malay States, Siam, Cambodia…",
            "og:site_name": "Telegraph",
            "handheldfriendly": "True",
            "og:title": "Where the Strange Trails go Down; Sulu, Borneo, Celebes, Bali, Java, Sumatra, Straits Settlements, Malay States, Siam, Cambodia…",
            "og:description": "🌐🌐🌐 This work has been selected by scholars as being culturally important, and is part of the knowledge base of civilization as we know it. This work was reproduced from the original artifact, and remains as true to the original work as possible. Therefore, you will see the original copyright references, library stamps (as most of these works have been housed in our most important libraries around the world), and other notations in the work.This work is in the public domain in the United States of America,…",
            "twitter:image": "https://cdn1.ozone.ru/multimedia/1030461496.jpg",
            "article:modified_time": "2019-09-10T03:10:51+0000",
            "viewport": "width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no",
            "twitter:description": "🌐🌐🌐 This work has been selected by scholars as being culturally important, and is part of the knowledge base of civilization as we know it. This work was reproduced from the original artifact, and remains as true to the original work as possible. Therefore, you will see the original copyright references, library stamps (as most of these works have been housed in our most important libraries around the world), and other notations in the work.This work is in the public domain in the United States of America,…",
            "mobileoptimized": "176",
            "format-detection": "telephone=no"
          }
        ],
        "cse_image": [
          {
            "src": "https://cdn1.ozone.ru/multimedia/1030461496.jpg"
          }
        ]
      }
    },
    {
      "kind": "customsearch#result",
      "title": "Something Strange in Usain Bolt's Stride – Telegraph",
      "htmlTitle": "Something <b>Strange</b> in Usain Bolt&#39;s Stride – Telegraph",
      "link": "https://telegra.ph/Something-Strange-in-Usain-Bolts-Stride-12-05",
      "displayLink": "telegra.ph",
      "snippet": "Dec 5, 2017 ... Last month, researchers here at Southern Methodist University, among the \nleading experts on the biomechanics of sprinting, said they found ...",
      "htmlSnippet": "Dec 5, 2017 <b>...</b> Last month, researchers here at Southern Methodist University, among the <br>\nleading experts on the biomechanics of sprinting, said they found&nbsp;...",
      "cacheId": "x4uUZEdKApAJ",
      "formattedUrl": "https://telegra.ph/Something-Strange-in-Usain-Bolts-Stride-12-05",
      "htmlFormattedUrl": "https://telegra.ph/Something-<b>Strange</b>-in-Usain-Bolts-Stride-12-05",
      "pagemap": {
        "cse_thumbnail": [
          {
            "src": "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcQX1SwAuIntXOU19jPibPd57jVoVJhyQGx8Xux9tn04rYtgTWNtEYqXiDmv",
            "width": "275",
            "height": "183"
          }
        ],
        "metatags": [
          {
            "og:type": "article",
            "article:published_time": "2017-12-05T08:11:40+0000",
            "twitter:card": "summary",
            "twitter:title": "Something Strange in Usain Bolt’s Stride",
            "og:site_name": "Telegraph",
            "handheldfriendly": "True",
            "og:title": "Something Strange in Usain Bolt’s Stride",
            "og:description": " Usain Bolt of Jamaica appeared on a video screen in a white singlet and black tights, sprinting in slow motion through the final half of a 100-meter race. Each stride covered nine feet, his upper body moving up and down almost imperceptibly, his feet striking the track and rising so rapidly that his heels did not touch the ground.\nBolt is the fastest sprinter in history, the world-record holder at 100 and 200 meters and the only person to win both events at three Olympics. Yet as he approaches his 31st birthday…",
            "article:author": "JERÉ LONGMAN JULY 20, 2017 on nytimes.com",
            "article:modified_time": "2017-12-05T08:11:40+0000",
            "viewport": "width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no",
            "twitter:description": " Usain Bolt of Jamaica appeared on a video screen in a white singlet and black tights, sprinting in slow motion through the final half of a 100-meter race. Each stride covered nine feet, his upper body moving up and down almost imperceptibly, his feet striking the track and rising so rapidly that his heels did not touch the ground.\nBolt is the fastest sprinter in history, the world-record holder at 100 and 200 meters and the only person to win both events at three Olympics. Yet as he approaches his 31st birthday…",
            "mobileoptimized": "176",
            "format-detection": "telephone=no"
          }
        ],
        "cse_image": [
          {
            "src": "https://static01.nyt.com/images/2017/07/19/sports/21bolt1/21bolt1-superJumbo.jpg"
          }
        ]
      }
    },
    {
      "kind": "customsearch#result",
      "title": "A STRANGE PERSON I MET ESSAY WRITING – Telegraph",
      "htmlTitle": "A <b>STRANGE</b> PERSON I MET ESSAY WRITING – Telegraph",
      "link": "https://telegra.ph/A-STRANGE-PERSON-I-MET-ESSAY-WRITING-08-25",
      "displayLink": "telegra.ph",
      "snippet": "Aug 25, 2018 ... Bitesize english literature poetry conflict Louisiana north carolina 1st report of \ninjury the onion autistic reporter afghanistan history. 67th Street ...",
      "htmlSnippet": "Aug 25, 2018 <b>...</b> Bitesize english literature poetry conflict Louisiana north carolina 1st report of <br>\ninjury the onion autistic reporter afghanistan history. 67th Street&nbsp;...",
      "cacheId": "Z_O9xoVsbWwJ",
      "formattedUrl": "https://telegra.ph/A-STRANGE-PERSON-I-MET-ESSAY-WRITING-08-25",
      "htmlFormattedUrl": "https://telegra.ph/A-<b>STRANGE</b>-PERSON-I-MET-ESSAY-WRITING-08-25",
      "pagemap": {
        "cse_thumbnail": [
          {
            "src": "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcSbAztOGv9yvTuzN62qppgYME7NyOv6Z0tnLXRK1eqvKwmtzdkVFjS4xBE",
            "width": "300",
            "height": "168"
          }
        ],
        "metatags": [
          {
            "og:type": "article",
            "article:published_time": "2018-08-25T09:14:48+0000",
            "twitter:card": "summary",
            "twitter:title": "A STRANGE PERSON I MET ESSAY WRITING",
            "og:site_name": "Telegraph",
            "handheldfriendly": "True",
            "og:title": "A STRANGE PERSON I MET ESSAY WRITING",
            "og:description": "Bitesize english literature poetry conflict Louisiana north carolina 1st report of injury the onion autistic reporter afghanistan history. 67th Street, West zip 10023 bitesize english literature poetry conflict W 79st Transverse Road zip 10024 reportajes sobre el dia de la mujer sherbrooke lodge care report child eld Lizella. Bitesize english literature poetry conflict reporter kristen menangis mendengar adzana Nassau Community College jamestown colony powerpoint presentation Fulton County fieldworking reading…",
            "article:author": "John Peterson",
            "article:modified_time": "2018-08-25T09:14:48+0000",
            "viewport": "width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no",
            "twitter:description": "Bitesize english literature poetry conflict Louisiana north carolina 1st report of injury the onion autistic reporter afghanistan history. 67th Street, West zip 10023 bitesize english literature poetry conflict W 79st Transverse Road zip 10024 reportajes sobre el dia de la mujer sherbrooke lodge care report child eld Lizella. Bitesize english literature poetry conflict reporter kristen menangis mendengar adzana Nassau Community College jamestown colony powerpoint presentation Fulton County fieldworking reading…",
            "mobileoptimized": "176",
            "format-detection": "telephone=no"
          }
        ],
        "cse_image": [
          {
            "src": "https://telegra.ph/file/eeab58efd76b999148b33.jpg"
          }
        ]
      }
    },
    {
      "kind": "customsearch#result",
      "title": "Life Is Strange Wallpaper 1080p Iraq – Telegraph",
      "htmlTitle": "Life Is <b>Strange</b> Wallpaper 1080p Iraq – Telegraph",
      "link": "https://telegra.ph/Life-Is-Strange-Wallpaper-1080p-Iraq-04-30",
      "displayLink": "telegra.ph",
      "snippet": "Apr 29, 2018 ... A Life at Stake - Free- Directed by Paul Guilfoyle, . Shock - Free This film noir tells \nthe story of psychiatrist Dr. Cross . Strange Illusion - . Best Full ...",
      "htmlSnippet": "Apr 29, 2018 <b>...</b> A Life at Stake - Free- Directed by Paul Guilfoyle, . Shock - Free This film noir tells <br>\nthe story of psychiatrist Dr. Cross . <b>Strange</b> Illusion - . Best Full&nbsp;...",
      "cacheId": "SRQ5QXiv4RMJ",
      "formattedUrl": "https://telegra.ph/Life-Is-Strange-Wallpaper-1080p-Iraq-04-30",
      "htmlFormattedUrl": "https://telegra.ph/Life-Is-<b>Strange</b>-Wallpaper-1080p-Iraq-04-30",
      "pagemap": {
        "metatags": [
          {
            "og:type": "article",
            "article:published_time": "2018-04-30T01:10:06+0000",
            "twitter:card": "summary",
            "twitter:title": "Life Is Strange Wallpaper 1080p Iraq",
            "og:site_name": "Telegraph",
            "handheldfriendly": "True",
            "og:title": "Life Is Strange Wallpaper 1080p Iraq",
            "og:description": "Life Is Strange Wallpaper 1080p Iraq",
            "article:author": "uyeglend",
            "article:modified_time": "2018-04-30T01:10:06+0000",
            "viewport": "width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no",
            "twitter:description": "Life Is Strange Wallpaper 1080p Iraq",
            "mobileoptimized": "176",
            "format-detection": "telephone=no"
          }
        ]
      }
    },
    {
      "kind": "customsearch#result",
      "title": "EPUB Sun in a Bottle: The Strange History of Fusion and the ...",
      "htmlTitle": "EPUB Sun in a Bottle: The <b>Strange</b> History of Fusion and the ...",
      "link": "https://telegra.ph/EPUB-Sun-in-a-Bottle-The-Strange-History-of-Fusion-and-the-Science-of-Wishful-Thinking-by-Charles-Seife-full-version-kickass-itu-09-21",
      "displayLink": "telegra.ph",
      "snippet": "Sep 21, 2017 ... EPUB Sun in a Bottle: The Strange History of Fusion and the Science of Wishful \nThinking by Charles Seife full version kickass itunes read eng.",
      "htmlSnippet": "Sep 21, 2017 <b>...</b> EPUB Sun in a Bottle: The <b>Strange</b> History of Fusion and the Science of Wishful <br>\nThinking by Charles Seife full version kickass itunes read eng.",
      "cacheId": "t6y2auF8v0YJ",
      "formattedUrl": "https://telegra.ph/EPUB-Sun-in-a-Bottle-The-Strange-History-of-Fusion-and- the-Science-of-Wishful-Thinking-by-Charles-Seife-full-version-kickass-itu- ...",
      "htmlFormattedUrl": "https://telegra.ph/EPUB-Sun-in-a-Bottle-The-<b>Strange</b>-History-of-Fusion-and- the-Science-of-Wishful-Thinking-by-Charles-Seife-full-version-kickass-itu- ...",
      "pagemap": {
        "metatags": [
          {
            "og:type": "article",
            "article:published_time": "2017-09-21T20:50:00+0000",
            "twitter:card": "summary",
            "twitter:title": "EPUB Sun in a Bottle: The Strange History of Fusion and the Science of Wishful Thinking by Charles Seife full version kickass itunes…",
            "og:site_name": "Telegraph",
            "handheldfriendly": "True",
            "og:title": "EPUB Sun in a Bottle: The Strange History of Fusion and the Science of Wishful Thinking by Charles Seife full version kickass itunes…",
            "og:description": "> READ BOOK > Sun in a Bottle: The Strange History of Fusion and the Science of Wishful Thinking\n> ONLINE BOOK > Sun in a Bottle: The Strange History of Fusion and the Science of Wishful Thinking\n> DOWNLOAD BOOK > Sun in a Bottle: The Strange History of Fusion and the Science of Wishful Thinking\n\nBook description\nBook description The author of Zero looks at the messy history of the struggle to harness fusion energy . When weapons builders detonated the first hydrogen bomb in 1952, they tapped into the vastest…",
            "article:author": "EPUB Sun in a Bottle: The Strange History of Fusion and the Science…",
            "article:modified_time": "2017-09-21T20:50:00+0000",
            "viewport": "width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no",
            "twitter:description": "> READ BOOK > Sun in a Bottle: The Strange History of Fusion and the Science of Wishful Thinking\n> ONLINE BOOK > Sun in a Bottle: The Strange History of Fusion and the Science of Wishful Thinking\n> DOWNLOAD BOOK > Sun in a Bottle: The Strange History of Fusion and the Science of Wishful Thinking\n\nBook description\nBook description The author of Zero looks at the messy history of the struggle to harness fusion energy . When weapons builders detonated the first hydrogen bomb in 1952, they tapped into the vastest…",
            "mobileoptimized": "176",
            "format-detection": "telephone=no"
          }
        ]
      }
    }
  ]
}