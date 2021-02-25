const mainSection = document.getElementById('posts-container');
function descriptionMaker(page) {
  mainSection.innerHTML = page.result.description;
}
/*makePage принимает объект page(), обращается к свойству result и вытаскивает оттуда массив объектов content, нём и находится текст статьи.
объекты в массиве content в документации называются Node, они содержат данные, используя которые можно собрать DOM элемент(https://telegra.ph/api#Node). Имеют следующий вид:
{
  tag: string,
  children: []
}
tag - название HTML-тега
Массив children хранит всех детей DOM-элемента. Элементы массива могут быть как строкой, так и Node-элементом. */
function makePage(page) {
  let content = page.result.content;
  content.forEach(elem => {
    mainSection.append(makeDomObj(elem));
  })
  function makeDomObj ({ tag, children = [], attrs }) {
    return children.reduce((acc, curr) => {
      if (attrs) {
        for (let key in attrs) {
          acc.setAttribute(key, attrs[key]);
        }
      }
      if (typeof curr === 'string') {
        acc.innerHTML += curr;
      } else {
        if (curr.children) {
          acc.append(makeDomObj(curr))
        } else {
          let temp = document.createElement(curr.tag); // приходится создавать DOM-элемент в ручную, так как если Node хранит одиночный 
          for (let key in curr.attrs) {                // тэг, то массива children там не будет, то есть параметр children будет равен 
            temp.setAttribute(key, curr.attrs[key]);   // undefined. Такова цена использования reduce.
          };
          acc.append(temp);
        };
      }
      return acc;
    }, document.createElement(tag));
  }
}

const testPage = fetch('https://api.telegra.ph/getPage/Tureckie-drony-kitajskoe-vtorzhenie-na-Tajvan-draka-za-mikrochipy-vojna-po-vsem-frontam-CHast-2-11-03?return_content=true');
testPage.then(response => {
  const newResponse = response.json();
  console.log(newResponse)
  return newResponse;
})
.then(makePage)