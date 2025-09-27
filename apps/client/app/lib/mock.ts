export const mockActorsENG = [
  {
    id: 1,
    name: "Leonardo DiCaprio",
    image: "https://image.tmdb.org/t/p/w500/wo2hJpn04vbtmh0B9utCFdsQhxM.jpg",
    movies: [
      "Inception",
      "Titanic",
      "The Wolf of Wall Street",
      "The Revenant",
      "Django Unchained",
      "Once Upon a Time in Hollywood",
      "Shutter Island",
      "Catch Me If You Can",
    ],
  },
  {
    id: 2,
    name: "Margot Robbie",
    image: "https://image.tmdb.org/t/p/w500/euDPyqLnuwaWMHajcU3oZ9uZezR.jpg",
    movies: [
      "Barbie",
      "The Wolf of Wall Street",
      "Suicide Squad",
      "Once Upon a Time in Hollywood",
      "I, Tonya",
      "Birds of Prey",
      "Bombshell",
      "Amsterdam",
    ],
  },
  {
    id: 3,
    name: "Ryan Gosling",
    image: "https://image.tmdb.org/t/p/w500/lyUyVARQKhGxaxy0FbPJCQRpiaW.jpg",
    movies: [
      "La La Land",
      "Blade Runner 2049",
      "The Notebook",
      "Drive",
      "First Man",
      "The Big Short",
      "Crazy, Stupid, Love",
      "Barbie",
    ],
  },
];

export const mockActorsITA = [
  {
    id: 1,
    name: "Leonardo DiCaprio",
    image: "https://image.tmdb.org/t/p/w500/wo2hJpn04vbtmh0B9utCFdsQhxM.jpg",
    movies: [
      "Inception",
      "Titanic",
      "The Wolf of Wall Street",
      "Revenant",
      "Django Unchained",
      "C'era una volta a... Hollywood",
      "Shutter Island",
      "Prova a prendermi",
    ],
  },
  {
    id: 2,
    name: "Margot Robbie",
    image: "https://image.tmdb.org/t/p/w500/euDPyqLnuwaWMHajcU3oZ9uZezR.jpg",
    movies: [
      "Barbie",
      "The Wolf of Wall Street", // Il lupo di Wall Street
      "Suicide Squad",
      "C'era una volta a... Hollywood",
      "Tonya",
      "Birds of Prey",
      "Bombshell",
      "Amsterdam",
    ],
  },
  {
    id: 3,
    name: "Ryan Gosling",
    image: "https://image.tmdb.org/t/p/w500/lyUyVARQKhGxaxy0FbPJCQRpiaW.jpg",
    movies: [
      "La La Land",
      "Blade Runner 2049",
      "Le pagine della nostra vita",
      "Drive",
      "First Man",
      "La grande scommessa",
      "Crazy, Stupid, Love",
      "Barbie",
    ],
  },
];

export const mockRounds = [
  {
    actor: {
      id: 1,
      name: "Natalie Portman",
      image:
        "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/edPU5HxncLWa1YkgRPNkSd68ONG.jpg",
    },
    choices: [
      { title: "Black Swan", isCorrect: true },
      { title: "The Hunger Games", isCorrect: false },
      { title: "The Devil Wears Prada", isCorrect: false },
    ],
  },
  {
    actor: {
      id: 2,
      name: "Leonardo DiCaprio",
      image: "https://image.tmdb.org/t/p/w500/wo2hJpn04vbtmh0B9utCFdsQhxM.jpg",
    },
    choices: [
      { title: "Inception", isCorrect: true },
      { title: "The Matrix", isCorrect: false },
      { title: "The Social Network", isCorrect: false },
    ],
  },
  {
    actor: {
      id: 3,
      name: "Emma Watson",
      image:
        "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/A14lLCZYDhfYdBa0fFRpwMDiwRN.jpg",
    },
    choices: [
      { title: "Harry Potter and the Philosopher's Stone", isCorrect: true },
      { title: "Twilight", isCorrect: false },
      { title: "The Chronicles of Narnia", isCorrect: false },
    ],
  },
  {
    actor: {
      id: 4,
      name: "Will Smith",
      image:
        "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/8TlKqbXYgHmmaEoPBJ7djJ8Rxxa.jpg",
    },
    choices: [
      { title: "Men in Black", isCorrect: true },
      { title: "Jurassic Park", isCorrect: false },
      { title: "Mission: Impossible", isCorrect: false },
    ],
  },
  {
    actor: {
      id: 5,
      name: "Scarlett Johansson",
      image:
        "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/mjReG6rR7NPMEIWb1T4YWtV11ty.jpg",
    },
    choices: [
      { title: "Lost in Translation", isCorrect: true },
      { title: "La La Land", isCorrect: false },
      { title: "Moulin Rouge!", isCorrect: false },
    ],
  },
];
