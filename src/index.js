const mainSection = document.getElementById('main');
function logTheJSON(obj) {
  console.log(obj);
}
const testPage = fetch('https://api.telegra.ph/getPage/Sample-Page-12-15');
 testPage/* .then(response => {
   const newResponse = response.json()
   return newResponse;
 }) */
.then(obj => console.log(obj))