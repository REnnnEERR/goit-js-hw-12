import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

import { getImagesByQuery } from './js/pixabay-api';
import {
    createGallery,
    clearGallery,
    showLoader,
    hideLoader,
    showLoadMoreButton,
    hideLoadMoreButton,
} from './js/render-functions';

const formEl = document.querySelector('.form');
const loadMoreBtn = document.querySelector('.load-more');

let query = '';
let page = 1;
let totalPages = 0;

formEl.addEventListener('submit', onSearch);
loadMoreBtn.addEventListener('click', onLoadMore);

async function onSearch(evt) {
    evt.preventDefault();
    query = evt.target.elements.searchQuery.value.trim();

    if (!query) return;

    page = 1;
    clearGallery();
    hideLoadMoreButton();
    showLoader();

    try {
        const data = await getImagesByQuery(query, page);

        if (data.hits.length === 0) {
            iziToast.error({
                message:
                    'Sorry, there are no images matching your search query. Please try again!',
            });
            return;
        }

        createGallery(data.hits);
        totalPages = Math.ceil(data.totalHits / 15);

        if (page < totalPages) {
            showLoadMoreButton();
        }

    } catch (error) {
        iziToast.error({ message: 'Something went wrong 😢' });
    } finally {
        hideLoader();
    }
}

async function onLoadMore() {
    page += 1;
    showLoader();

    try {
        const data = await getImagesByQuery(query, page);
        createGallery(data.hits);
        smoothScroll();

        if (page >= totalPages) {
            hideLoadMoreButton();
            iziToast.info({
                message: "We're sorry, but you've reached the end of search results.",
            });
        }
    } catch (error) {
        iziToast.error({ message: 'Something went wrong 😢' });
    } finally {
        hideLoader();
    }
}

function smoothScroll() {
    const card = document.querySelector('.photo-card');
    if (!card) return;

    const { height } = card.getBoundingClientRect();

    window.scrollBy({
        top: height * 2,
        behavior: 'smooth',
    });
}
