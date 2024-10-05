
window.addEventListener("scroll", function() {
    const header = document.querySelector("header");   

    if (window.scrollY > 0) {
      header.classList.add('blur-bg');
    } 
    else {
      header.classList.remove('blur-bg');
    }
});

function displayTime(seconds) {
    const years = Math.floor(seconds / (365 * 24 * 60 * 60));
    const months = Math.floor((seconds % (365 * 24 * 60 * 60)) / (30 * 24 * 60 * 60));
    const weeks = Math.floor((seconds % (30 * 24 * 60 * 60)) / (7 * 24 * 60 * 60));
    const days = Math.floor((seconds % (7 * 24 * 60 * 60)) / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    const remainingSeconds = seconds % 60; // Calculate remaining seconds

    if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
    if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
    if (weeks > 0) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (remainingSeconds > 0) return `${remainingSeconds} second${remainingSeconds > 1 ? 's' : ''} ago`; // New case for seconds

    return 'just now';
}

let jsonVideos;

function loadAllData(categoryId) {
    fetch('https://openapi.programming-hero.com/api/phero-tube/videos')
      .then(response => response.json())
      .then(json => {
        jsonVideos = json.videos;
        displayData(jsonVideos, categoryId);  
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
}

function displayData(dataArray, categoryId) {
    if(categoryId === '0') {
        dataArray.forEach(data => {
            createCard(data);
        });
    } else {
        let count = 0;
        dataArray.forEach(data => {
            if(categoryId === data.category_id) {
                createCard(data);
                count++;
            }
        })

        if(count === 0) {
            noContentMessage();
        }
    }
}

function createCard(data) {
    const allCardsContainer = document.getElementById('all-cards-container');

    const card = document.createElement('div');
    card.innerHTML = `
      <div class="card bg-base-100 shadow-xl relative cursor-pointer">
        <figure class="h-48 w-full">
          <img class="object-cover h-full w-full" src="${data.thumbnail}" alt="thumbnail"/>
        </figure>
        <div class="p-3 flex gap-3">
          <div class="h-10 w-10 rounded-full">
            <img class="h-full w-full rounded-full object-cover" src="${data.authors[0].profile_picture}" alt="">
          </div>    
          <div class="w-[80%]">
            <h2 class="card-title">${data.title}</h2>
            <div class="flex items-center gap-1">
              <p>${data.authors[0].profile_name}</p>
              ${data.authors[0].verified ? 
                `<div class="h-5 w-5">
                  <img src="./resources/verified.png" alt="Verified">
                </div>` 
                : ''}
            </div>
            <p>${data.others.views} views</p>
          </div>
          <div class="bg-black rounded absolute top-28 right-3 p-2">
            <p class="text-slate-300">${displayTime(data.others.posted_date)}</p>
          </div>
        </div>
      </div>
    `;
    
    allCardsContainer.appendChild(card);
}

function noContentMessage() {
    const allCardsContainer = document.getElementById('all-cards-container');

    const messageHTML = `
        <div class="flex flex-col items-center gap-5 p-5">
            <div><img src="./resources/Icon.png" alt="No content icon"></div>
            <div><h2 class="text-2xl font-extrabold text-center">Oops!! Sorry, There is no content here</h2></div>
        </div>
    `;

    allCardsContainer.innerHTML = messageHTML;
    allCardsContainer.classList.remove('lg:grid-cols-4');
}



loadAllData('0');



const buttons = document.querySelectorAll('#categories button');

function handleButtonClick(event) {
    document.getElementById('all-cards-container').innerHTML = "";
    document.getElementById('all-cards-container').classList.add('lg:grid-cols-4');
    for (const button of buttons) {
        button.classList.remove('btn-error');
    }

    event.target.classList.add('btn-error');

    if(event.target.id === 'all-btn') {
        displayData(jsonVideos, '0');
    }
    else if(event.target.id === 'music-btn') {
        displayData(jsonVideos, '1001');
    }
    else if(event.target.id === 'comedy-btn') {
        displayData(jsonVideos, '1003');
    }
    else if(event.target.id === 'drawing-btn') {
        displayData(jsonVideos, '1005');
    }
}

for (const button of buttons) {
    button.addEventListener('click', handleButtonClick);
}

document.getElementById('search').addEventListener('focus', function() {
    document.getElementById('all-cards-container').innerHTML = "";
    document.getElementById('all-cards-container').classList.add('lg:grid-cols-4');
    
    for (const button of buttons) {
        button.classList.remove('btn-error');
    }

    document.getElementById('all-btn').classList.add('btn-error');
    displayData(jsonVideos, '0');
});

document.getElementById('search').addEventListener('keyup', (event) => {
    const userInput = event.target.value.toLowerCase();
    
    const matchedVideos = jsonVideos.filter(video => {
        return video.title.toLowerCase().includes(userInput);
    });

    document.getElementById('all-cards-container').innerHTML = "";
    document.getElementById('all-cards-container').classList.add('lg:grid-cols-4');

    if(matchedVideos.length > 0) {
        displayData(matchedVideos, '0');
    } else {
        noContentMessage();
    }
})

document.getElementById('sort').addEventListener('click', () => {
    const sortedVideos = [...jsonVideos].sort((a, b) => {
        const viewsA = parseInt(a.others.views.replace('K', '')) * 1000;
        const viewsB = parseInt(b.others.views.replace('K', '')) * 1000;

        return viewsB - viewsA;
    });

    document.getElementById('all-cards-container').innerHTML = "";
    document.getElementById('all-cards-container').classList.add('lg:grid-cols-4');

    for (const button of buttons) {
        button.classList.remove('btn-error');
    }

    document.getElementById('all-btn').classList.add('btn-error');

    displayData(sortedVideos, '0');
})