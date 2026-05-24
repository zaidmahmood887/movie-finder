import './style.css'

const app = document.querySelector('#app')

let allMovies = []
let filteredMovies = []

// favorieten ophalen, als er niks is gewoon lege array
let favorites =
  JSON.parse(localStorage.getItem('favorites')) || []

async function getMovies() {

  app.innerHTML = `<h1>Loading movies...</h1>`

  try {

    app.innerHTML = `
      <h1>Loading movies...</h1>
    `

    const response = await fetch(
      'https://api.tvmaze.com/shows'
    )

    allMovies = await response.json()

    filteredMovies = [...allMovies]

    renderPage()

  } catch (error) {

    app.innerHTML = `
      <h1>Something went wrong...</h1>
    `

  }

}

function renderPage() {

  app.innerHTML = `

    <button id="theme-btn">
      🌙 Dark Mode
    </button>

    <div class="container">

      <header>

        <h1>🎬 Movie Finder</h1>

        <div class="controls">

          <input
            type="text"
            id="search"
            placeholder="Search movies..."
          />

          <select id="genre-filter">

            <option value="all">
              All Genres
            </option>

            <option value="Drama">
              Drama
            </option>

            <option value="Comedy">
              Comedy
            </option>

            <option value="Action">
              Action
            </option>

          </select>

          <select id="sort">

            <option value="default">
              Sort Movies
            </option>

            <option value="az">
              A-Z
            </option>

            <option value="rating">
              Highest Rating
            </option>

          </select>

        </div>

      </header>

      <main id="movie-container"></main>

      <footer>
        gemaakt door Zaid - Advanced Web Project
      </footer>

    </div>

  `

  displayMovies(filteredMovies)

  setupSearch()

  setupSort()

  setupGenreFilter()

  setupFavorites()

  setupTheme()

  setupMovieDetails()

  setupObserver()

}

// films weergeven
function displayMovies(movies) {

  const movieContainer =
    document.querySelector('#movie-container')

  if (movies.length === 0) {

    movieContainer.innerHTML = `
      <h2>No movies found...</h2>
    `

    return

  }

  // max 20 anders duurt het te lang
  movieContainer.innerHTML = movies
    .slice(0, 20)
    .map(movie => `

      <div
        class="movie-card"
        data-id="${movie.id}"
      >

        <img
          src="${movie.image?.medium}"
          alt="${movie.name}"
        />

        <h2>${movie.name}</h2>

        <p>
          ⭐ ${movie.rating.average || 'No rating'}
        </p>

        <p>
          ${movie.genres.join(', ')}
        </p>

        <button
          class="favorite-btn
          ${favorites.includes(movie.id) ? 'active' : ''}"
          data-id="${movie.id}"
        >

          ${
            favorites.includes(movie.id)
              ? '💔 Remove'
              : '❤️ Favorite'
          }

        </button>

      </div>

    `)
    .join('')

}

function setupSearch() {

  const searchInput =
    document.querySelector('#search')

  searchInput.addEventListener('input', event => {

    const value =
      event.target.value.toLowerCase()

    filteredMovies = allMovies.filter(movie =>
      movie.name.toLowerCase().includes(value)
    )

    displayMovies(filteredMovies)

    setupFavorites()

    setupMovieDetails()

    setupObserver()

  })

}

function setupSort() {

  const sortSelect =
    document.querySelector('#sort')

  sortSelect.addEventListener('change', event => {

    const value = event.target.value

    // alfabetisch sorteren
    if (value === 'az') {

      filteredMovies.sort((a, b) =>
        a.name.localeCompare(b.name)
      )

    }

    // hoogste rating eerst
    if (value === 'rating') {

      filteredMovies.sort((a, b) =>
        (b.rating.average || 0)
        - (a.rating.average || 0)
      )

    }

    displayMovies(filteredMovies)

    setupFavorites()

    setupMovieDetails()

    setupObserver()

  })

}

function setupGenreFilter() {

  const genreFilter =
    document.querySelector('#genre-filter')

  genreFilter.addEventListener('change', event => {

    const value = event.target.value

    if (value === 'all') {

      filteredMovies = [...allMovies]

    } else {

      // alleen films met dit genre tonen
      filteredMovies = allMovies.filter(movie =>
        movie.genres.includes(value)
      )

    }

    displayMovies(filteredMovies)

    setupFavorites()

    setupMovieDetails()

    setupObserver()

  })

}

function setupFavorites() {

  const buttons =
    document.querySelectorAll('.favorite-btn')

  buttons.forEach(button => {

    button.addEventListener('click', event => {

      // anders opent de modal ook
      event.stopPropagation()

      const movieId =
        Number(button.dataset.id)

      if (favorites.includes(movieId)) {

        favorites =
          favorites.filter(id => id !== movieId)

      } else {

        favorites.push(movieId)

      }

      // opslaan zodat het bewaard blijft na herladen
      localStorage.setItem(
        'favorites',
        JSON.stringify(favorites)
      )

      displayMovies(filteredMovies)

      setupFavorites()

      setupMovieDetails()

      setupObserver()

    })

  })

}

function setupTheme() {

  const themeBtn =
    document.querySelector('#theme-btn')

  const savedTheme =
    localStorage.getItem('theme')

  if (savedTheme === 'light') {

    document.body.classList.add('light')

  }

  themeBtn.addEventListener('click', () => {

    document.body.classList.toggle('light')

    if (
      document.body.classList.contains('light')
    ) {

      localStorage.setItem('theme', 'light')

    } else {

      localStorage.setItem('theme', 'dark')

    }

  })

}

// modal openen als je op een kaart klikt
function setupMovieDetails() {

  const cards =
    document.querySelectorAll('.movie-card')

  cards.forEach(card => {

    card.addEventListener('click', () => {

      const movieId =
        Number(card.dataset.id)

      const movie =
        allMovies.find(m => m.id === movieId)

      const modal = document.createElement('div')

      modal.classList.add('modal')

      modal.innerHTML = `

        <div class="modal-content">

          <span class="close-modal">
            ✖
          </span>

          <h2>${movie.name}</h2>

          <img
            src="${movie.image?.original}"
          />

          <p>
            ⭐ ${movie.rating.average || 'No rating'}
          </p>

          <p>
            ${movie.genres.join(', ')}
          </p>

          <div>
            ${movie.summary}
          </div>

        </div>

      `

      document.body.appendChild(modal)

      const closeBtn =
        modal.querySelector('.close-modal')

      closeBtn.addEventListener('click', () => {

        modal.remove()

      })

    })

  })

}

// animatie als kaarten in beeld komen
function setupObserver() {

  const cards =
    document.querySelectorAll('.movie-card')

  const observer =
    new IntersectionObserver(entries => {

      entries.forEach(entry => {

        if (entry.isIntersecting) {

          entry.target.classList.add('show')

        }

      })

    })

  cards.forEach(card => {

    observer.observe(card)

  })

}

// alles starten
getMovies()