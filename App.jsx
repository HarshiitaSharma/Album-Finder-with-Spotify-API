import "./App.css";
import {
  FormControl,
  InputGroup,
  Container,
  Button,
  Card,
  Row,
  Spinner,
} from "react-bootstrap";
import { useState, useEffect } from "react";

const clientId = import.meta.env.VITE_CLIENT_ID;
const clientSecret = import.meta.env.VITE_CLIENT_SECRET;

function App() {
  const [searchInput, setSearchInput] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [albums, setAlbums] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let authParams = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body:
        "grant_type=client_credentials&client_id=" +
        clientId +
        "&client_secret=" +
        clientSecret,
    };

    fetch("https://accounts.spotify.com/api/token", authParams)
      .then((result) => result.json())
      .then((data) => {
        setAccessToken(data.access_token);
      })
      .catch((err) => {
        setError("Failed to fetch access token");
        console.error(err);
      });
  }, []);

  async function search() {
    if (!searchInput.trim()) {
      alert("Please enter an artist name.");
      return;
    }

    setIsLoading(true); // Start loading
    setError(null); // Reset error

    let artistParams = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
    };

    try {
      // Get Artist
      const artistID = await fetch(
        `https://api.spotify.com/v1/search?q=${searchInput}&type=artist`,
        artistParams
      )
        .then((result) => result.json())
        .then((data) => data.artists.items[0]?.id);

      if (!artistID) {
        setError("No artist found");
        setIsLoading(false);
        return;
      }

      // Get Artist Albums
      const albumData = await fetch(
        `https://api.spotify.com/v1/artists/${artistID}/albums?include_groups=album&market=US&limit=50`,
        artistParams
      ).then((result) => result.json());

      setAlbums(albumData.items);
      setIsLoading(false); // Stop loading
    } catch (err) {
      setError("Failed to fetch albums");
      console.error(err);
      setIsLoading(false); // Stop loading
    }
  }

  return (
    <>
      <Container>
        <InputGroup>
          <FormControl
            placeholder="Search For Artist"
            type="input"
            aria-label="Search for an Artist"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                search();
              }
            }}
            onChange={(event) => setSearchInput(event.target.value)}
            style={{
              width: "300px",
              height: "35px",
              borderWidth: "0px",
              borderStyle: "solid",
              borderRadius: "5px",
              marginRight: "10px",
              paddingLeft: "10px",
            }}
          />
          <Button onClick={search}>Search</Button>
        </InputGroup>
      </Container>

      {isLoading ? (
        <Container className="text-center" style={{ marginTop: "20px" }}>
          <Spinner animation="border" variant="primary" />
          <p>Loading...</p>
        </Container>
      ) : error ? (
        <Container className="text-center" style={{ marginTop: "20px" }}>
          <p>{error}</p>
        </Container>
      ) : (
        albums.length === 0 ? (
          <Container className="text-center" style={{ marginTop: "20px" }}>
            <p>No albums found for this artist.</p>
          </Container>
        ) : (
          <Container>
            <Row
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-around",
                alignContent: "center",
              }}
            >
              {albums.map((album) => {
                return (
                  <Card
                  
                    key={album.id}
                    style={{
                      backgroundColor: "white",
                      margin: "10px",
                      borderRadius: "5px",
                      marginBottom: "30px",
                    }}
                  >
                    <Card.Img
                      width={200}
                      src={album.images[0]?.url}
                      style={{
                        borderRadius: "4%",
                      }}
                    />
                    <Card.Body>
                      <Card.Title
                        style={{
                          whiteSpace: "wrap",
                          fontWeight: "bold",
                          maxWidth: "200px",
                          fontSize: "18px",
                          marginTop: "10px",
                          color: "black",
                        }}
                      >
                        {album.name}
                      </Card.Title>
                      <Card.Text style={{ color: "black" }}>
                        Release Date: <br /> {album.release_date}
                      </Card.Text>
                      <Button
                        href={album.external_urls?.spotify || '#'}
                        target="_blank"
                        style={{
                          backgroundColor: "black",
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "15px",
                          borderRadius: "5px",
                          padding: "10px",
                        }}
                        disabled={!album.external_urls?.spotify} // Disable button if no URL
                      >
                        Album Link
                      </Button>
                    </Card.Body>
                  </Card>
                );
              })}
            </Row>
          </Container>
        )
      )}
    </>
  );
}

export default App;
