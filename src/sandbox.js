function makeListOfPages({ items }) {
  items.forEach(elem => {
    mainSection.innerHTML = makePageCard(elem);
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
  return (`<div class="col">
            <div class="card">
              <img src="${imgThumbnail || img || 'no-img'}" class="card-img-top">
              <div class="card-body">
                <h5>${title}</h5>
                <p>
                  <a href="${link}">${link}</a>
                </p>
              </div>
            </div>
          </div>`)
}

class Article {
  constructor( {
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
    this.link = link;
    this.title = title;
    this.imgThumbnail = imgThumbnail;
    this.img = img;
  }
  makePageCardObj() {
    console.log(this.link);
    console.log(this.title);
    console.log(this.imgThumbnail);
    console.log(this.img);
  }
}

const testArr = googleAPIResponse.items.map(elem => new Article(elem));
testArr[0].makePageCardObj();

const moduleTesting = () => {
  let containerAPI = {
    cardsContainer,
    pageContainer
  }
  return containerAPI

  function cardsContainer() {
    return document.getElementById('parent');
  }
  function pageContainer() {
    return document.getElementById('page-parent');
  }
}