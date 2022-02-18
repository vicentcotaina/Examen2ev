'use strict';
class MyPosition {
  constructor(latitude, longitude) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.accuracy = 0;
  }
  getHTML() {
    return `<p>${this.latitude}</p><p>${this.longitude}</p><p>${this.accuracy}</p>`;
  }
  setAccuracy(accuracy) {
    return new Promise((resolve, reject) => {
      this.accuracy = accuracy;
      resolve(this.getHTML());
    });
  }
}
(async () => {
  const optionsActiveUsers = [];
  const loadingMessage = document.createElement('p');
  loadingMessage.innerHTML = 'Loading...';
  document.body.append(loadingMessage);
  const users = await getUsersObject('https://gorest.co.in/public/v1/users');
  for (const elem of users.data) {
    if (elem.status == 'active') {
      const activeUser = document.createElement('option');
      activeUser.value = elem.name;
      activeUser.innerHTML = `${elem.name}(${elem.email})`;
      optionsActiveUsers.push(activeUser);
    }
  }
  const dropdownList = document.createElement('select');
  dropdownList.addEventListener('change', (event) => {
    sessionStorage.setItem('user', dropdownList.value);
    event.target.remove();
    const header = document.createElement('header');
    const geolocationSection = document.createElement('section');
    document.body.append(header, geolocationSection);
    const selectedUser = users.data.find(
      (elem) => elem.name == sessionStorage.getItem('user')
    );
    header.innerHTML = `Username:${selectedUser.name} Email:${selectedUser.email} Gender:${selectedUser.gender}`;
    const geolocationInput = document.createElement('input');
    geolocationInput.addEventListener('input', (event) => {
      if (event.target.value === 'locate me') {
        navigator.geolocation.getCurrentPosition((position) => {
          const objectPosition = new MyPosition(
            position.coords.latitude,
            position.coords.longitude
          );
          objectPosition
            .setAccuracy(position.coords.accuracy)
            .then(() => {
              const div = document.createElement('div');
              geolocationSection.prepend(div);
              div.innerHTML = objectPosition.getHTML();
            })
            .catch(() => {
              const errorMessage = document.createElement('p');
              errorMessage.innerHTML = 'Not able to geolocate you';
              geolocationSection.prepend(errorMessage);
            });
        });
      }
    });
    geolocationSection.append(geolocationInput);
    const toDoListSection = document.createElement('section');
    document.body.prepend(toDoListSection);
    const loadingMessage2 = document.createElement('p');
    loadingMessage2.innerHTML = 'Loading...';
    toDoListSection.append(loadingMessage2);
    (async () => {
      const toDoListData = await getToDoListObject(
        'https://gorest.co.in/public/v1/todos'
      );
      loadingMessage2.remove();
      const divToDoList = document.createElement('div');
      for (const elem of toDoListData.data) {
        const toDoElement = document.createElement('p');
        toDoElement.innerHTML = elem.title;
        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = 'Delete';
        deleteButton.addEventListener('click', (event) => {
          deleteToDoElement(
            `https://gorest.co.in/public/v1/todos/${elem.id}?access-token=4fb35d4ed74c15d95f5a823b7a6aa08082190b7878284e4237e1517c0fd6526d`
          ).then((response) => {
            console.log(response);
          });
        });
        divToDoList.append(toDoElement, deleteButton);
      }
      document.body.append(divToDoList);
    })();
  });
  for (const optionActiveUser of optionsActiveUsers) {
    dropdownList.append(optionActiveUser);
  }
  loadingMessage.remove();
  document.body.append(dropdownList);
})();

async function getUsersObject(url) {
  const response = await fetch(url);
  if (response.ok) {
    return response.json();
  } else {
    throw new Error('Error getting the users.');
  }
}
async function getToDoListObject(url) {
  const response = await fetch(url);
  if (response.ok) {
    return response.json();
  } else {
    throw new Error('Error getting the to do list.');
  }
}
async function deleteToDoElement(url) {
  const response = await fetch(url);
  if (response.ok) {
    return response.json();
  } else {
    throw new Error('Error deleting the to do element.');
  }
}
