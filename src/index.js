import Notiflix from 'notiflix';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const API_KEY = '41283522-be7eb0bdad8f052e10c740a6d';
const BASE_URL = 'https://pixabay.com/api/';
const searchForm = document.querySelector('.search-form');
const galleryList = document.querySelector('.gallery');
const loadMoreButton = document.querySelector('.load-wrapper');

const cardsPerPage = 40;
let pageNumber = 1;

loadMoreButton.hidden = true;

const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: '250',
});

async function loadPics(page = 1) {
  const searchQuery = searchForm.elements.searchQuery.value;

  try {
    const response = await axios.get(BASE_URL, {
      params: {
        key: API_KEY,
        q: searchQuery,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: 'true',
        page: page,
        per_page: cardsPerPage,
      },
    });

    handleResponse(response, page);

  } catch (error) {
    handleRequestError(error);
  }
}

function handleResponse(response, page) {
  const markup = response.data.hits
    .map(hit => `
      <div class="photo-card">
        <a class="gallery__link" href=${hit.largeImageURL}>
          <img class="gallery__image" src=${hit.previewURL} alt=${hit.tags} loading="lazy" />
        </a>
        <div class="info">
          <p class="info-item"><b>Likes:</b> ${hit.likes}</p>
          <p class="info-item"><b>Views:</b> ${hit.views}</p>
          <p class="info-item"><b>Comments:</b> ${hit.comments}</p>
          <p class="info-item"><b>Downloads:</b> ${hit.downloads}</p>
        </div>
      </div>`
    )
    .join('');

  loadMoreButton.hidden = false;

  if (response.data.totalHits === 0) {
    loadMoreButton.hidden = true;
    Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
  } else {
    if (page === 1) {
      Notiflix.Notify.success(`Hooray! We found ${response.data.totalHits} images.`);
    }
  }

  if (response.data.totalHits <= page * cardsPerPage && page !== 1) {
    loadMoreButton.hidden = true;
    Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
  }

  galleryList.insertAdjacentHTML('beforeend', markup);

  lightbox.refresh();

  if (page > 1) {
    const { height: cardHeight } = galleryList.firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 1.5,
      behavior: 'smooth',
    });
  }
}

function handleRequestError(error) {
  Notiflix.Notify.failure(`Error: ${error}`);
}

searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  pageNumber = 1;
  loadPics();
  loadMoreButton.hidden = true;
  galleryList.textContent = '';
});

loadMoreButton.addEventListener('click', (event) => {
  event.preventDefault();
  pageNumber += 1;
  loadPics(pageNumber);
});