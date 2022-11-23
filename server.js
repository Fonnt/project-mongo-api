import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
// If you're using one of our datasets, uncomment the appropriate import below
// to get started!
// import avocadoSalesData from "./data/avocado-sales.json";
// import booksData from "./data/books.json";
// import goldenGlobesData from "./data/golden-globes.json";
// import netflixData from "./data/netflix-titles.json";
import topMusicData from "./data/top-music.json";

dotenv.config()

const mongoUrl = process.env.MONGO_URL || `mongodb+srv://Font:${process.env.STRING_PW}@cluster0.8xh88s6.mongodb.net/projectMongo?retryWrites=true&w=majority`;
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

// Defines the port the app will run on. Defaults to 8080, but can be overridden
// when starting the server. Example command to overwrite PORT env variable value:
// PORT=9000 npm start

// This is the first model. It's not putting info into the DB. It specify the types
const Song = mongoose.model("Song", {
  id: Number,
  trackName: String,
  artistName: String,
  genre: String,
  bpm: Number,
  energy: Number,
  danceability: Number,
  loudness: Number,
  liveness: Number,
  valence: Number,
  length: Number,
  acousticness: Number,
  speechiness: Number,
  popularity: Number
});


// Deleting DB is in this case for educational porpouses. 
// And then populating it with Songs
if (process.env.RESET_DB) {
  const resetDataBase = async () => {
    await Song.deleteMany();
    topMusicData.forEach(singleSong => {
      const newSong = new Song(singleSong);
      newSong.save();
    })
  }
  resetDataBase();
};

const port = process.env.PORT || 8080;
const app = express();

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(express.json());

// Start defining your routes here
app.get("/", (req, res) => {
  res.status(200).json({
    resMessage: "Top music data",
    endPoints: "/songs -- /artist/:artistName -- /trackname/:trackname",
    lists: "/lists?artistlist=true -- /lists?songlist=true"
  });
});

// This will return an array of all songs and handles status 200
app.get("/songs", (req, res) => {
  const songs = topMusicData;
  res.status(200).json({
    success: true,
    message: "OK",
    response: {
      topMusicData: songs
    }
  });
});

// This is an experiment.
// It returns a list of all songs or artists based on queries
app.get("/lists", (req, res) => {
  const { songlist, artistlist } = req.query;

  if (songlist) {
    const songlist = topMusicData.map((song) => song.trackName)
    res.status(200).json({
      success: true,
      message: "OK",
      response: {
        songList: songlist,
      }
    });
  }
  if (artistlist) {
    const artistList = topMusicData.map((artist) => artist.artistName)
    res.status(200).json({
      success: true,
      message: "OK",
      response: {
        songList: artistList,
      }
    });
  }
  res.status(200).json({
    success: true,
    message: "OK",
    quieries: "/lists?artistlist=true -- /lists?songlist=true"
  });
})


// This will return a single song sorted by trackname.
// Handles 404
app.get("/trackname/:trackname", (req, res) => {
  const singleTrack = topMusicData.find((track) => {
    return track.trackName.toLowerCase() === req.params.trackname.toLowerCase();
  });
  if (singleTrack) {
    res.status(200).json({
      succes: true,
      message: "OK",
      response: {
        singleTrack: singleTrack
      }
    });
  } else {
    res.status(404).json({
      success: false,
      message: "Track not found",
      response: {}
    });
  }
});

// This will return a single artist with an array of all songs. 
// Handles 404 if name is wrong
app.get("/artist/:artistName", (req, res) => {
  const singleArtist = topMusicData.filter((artist) => {
    return artist.artistName.toLowerCase() === req.params.artistName.toLowerCase();
  });
  if (singleArtist) {
    res.status(200).json({
      success: true,
      message: "OK",
      response: {
        singleArtist: singleArtist
      }
    });
  } else {
    res.status(404).json({
      success: false,
      message: "Artist not found",
      response: {}
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
