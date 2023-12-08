import { useState, useEffect } from 'react';

// Import Apollo Client hooks
import { useQuery, useMutation } from '@apollo/client';
import { SAVE_BOOK, DELETE_BOOK } from '../utils/mutations';
import { GET_ME } from '../utils/queries';

import {
  Container,
  Col,
  Form,
  Button,
  Card,
  Row
} from 'react-bootstrap';

import Auth from '../utils/auth';
import { searchGoogleBooks } from '../utils/API';
import { saveBookIds, getSavedBookIds } from '../utils/localStorage';

const SearchBooks = () => {
  // create state for holding returned google api data
  const [searchedBooks, setSearchedBooks] = useState([]);
  // create state for holding our search field data
  const [searchInput, setSearchInput] = useState('');
  // create state to hold saved bookId values
  const [savedBookIds, setSavedBookIds] = useState(getSavedBookIds());
  // Use useQuery hook to fetch user data
  const { loading, data } = useQuery(GET_ME);
  const userData = data?.me || {};

  // Use useMutation hook for the saveBook and removeBook mutations
  const [saveBook] = useMutation(SAVE_BOOK);
  const [removeBook] = useMutation(DELETE_BOOK);

  // set up useEffect hook to save `savedBookIds` list to localStorage on component unmount
  // learn more here: https://reactjs.org/docs/hooks-effect.html#effects-with-cleanup
  useEffect(() => {
    return () => saveBookIds(savedBookIds);
  }, [savedBookIds]);

  // create method to search for books and set state on form submit
  const handleFormSubmit = async (event) => {
    event.preventDefault();

    if (!searchInput) {
      return false;
    }

    try {
      const response = await searchGoogleBooks(searchInput);

      if (!response.ok) {
        throw new Error('something went wrong!');
      }

      const { items } = await response.json();

      const bookData = items.map((book) => ({
        bookId: book.id,
        authors: book.volumeInfo.authors || ['No author to display'],
        title: book.volumeInfo.title,
        description: book.volumeInfo.description,
        image: book.volumeInfo.imageLinks?.thumbnail || '',
      }));

      setSearchedBooks(bookData);
      setSearchInput('');
    } catch (err) {
      console.error(err);
    }
  };

  // create function to handle saving a book to our database
  const handleSaveBook = async (bookId) => {
    // find the book in `searchedBooks` state by the matching id
    const bookToSave = searchedBooks.find((book) => book.bookId === bookId);

    // get token
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
      // Save book using the saveBook mutation
      const response = await saveBook(bookToSave, token);

      if (!response.ok) {
        throw new Error('something went wrong!');
      }

      // if book successfully saves to user's account, save book id to state
      setSavedBookIds([...savedBookIds, bookToSave.bookId]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBook = async (bookId) => {
    try {
      // Remove book using the removeBook mutation
      const { data } = await removeBook({
        variables: { bookId: bookId },
      });

      setSearchedBooks(data.removeBook.savedBooks);
      setSavedBookIds(data.removeBook.savedBooks.map(book => book.bookId));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="text-light bg-dark p-5">
        <Container>
          <p>Loading...</p>
        </Container>
      </div>
    );
  }

  return (
    <>
      <div className="text-light bg-dark p-5">
        <Container>
          <h1>Search for Books!</h1>
          <Form onSubmit={handleFormSubmit}>
            <Row>
              <Col xs={12} md={8}>
                <Form.Control
                  name='searchInput'
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  type='text'
                  size='lg'
                  placeholder='Search for a book'
                />
              </Col>
              <Col xs={12} md={4}>
                <Button type='submit' variant='success' size='lg'>
                  Submit Search
                </Button>
              </Col>
            </Row>
          </Form>
        </Container>
      </div>

      <Container>
        <h2 className='pt-5'>
          {searchedBooks.length
            ? `Viewing ${searchedBooks.length} results:`
            : 'Search for a book to begin'}
        </h2>
        <Row>
          {searchedBooks.map((book) => {
            const isBookSaved = userData.savedBooks.some(savedBook => savedBook.bookId === book.bookId);

            return (
              <Col md="4" key={book.bookId}>
                <Card border='dark'>
                  {/* ... (existing code) */}
                  <Card.Body>
                    {/* ... (existing code) */}
                    {Auth.loggedIn() && (
                      <div>
                        <Button
                          disabled={isBookSaved}
                          className='btn-block btn-info'
                          onClick={() => handleSaveBook(book.bookId)}>
                          {isBookSaved ? 'This book has already been saved!' : 'Save this Book!'}
                        </Button>
                        <Button
                          className='btn-block btn-danger'
                          onClick={() => handleDeleteBook(book.bookId)}>
                          Remove from saved
                        </Button>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </>
  );
};

export default SearchBooks;