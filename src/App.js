import axios from 'axios';
import React from 'react';
import './App.css'

// make story global variable

// const initialStories =
// [
//      {
//        title: "React",
//        url: "https://reactjs.org/",
//        author: "Jordan Walke",
//        num_comments: 3,
//        points: 4,
//        objectID: 0,
//      },
//      {
//        title: "Redux",
//        url: "https://redux.js.org/",
//        author: "Dan Abramov, Andrew Clark",
//        num_comments: 2,
//        points: 5,
//        objectID: 1,
//      },
// ];

//fetching data

const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';

// the storiesReducer function. takes care of changing a state.

const storiesReducer = (state, action) => {
switch (action.type){
  case'SET_STORIES' :
    return action.payload;
  case'STORIES_FETCH_INIT' :
    return {
      ...state,
      isLoading: true,
      isError: false,
    };
  case'STORIES_FETCH_SUCCESS' :
    return {
      ...state,
      isLoading: false,
      isError: false,
      data: action.payload,
    };
  case'STORIES_FETCH_FAILURE' :
    return {
      ...state,
      isLoading: false,
      isError: true,
    };
  case'REMOVE_STORY' :
    return {
      ...state,
      data: state.data.filter(
        story => action.payload.objectID !== story.objectID
      ),
    };
  default:
    throw new Error();
}
};
const useSemiPersistentState = (key , initialState) => {
  const [value, setValue] = 
   React.useState( localStorage.getItem(key) || initialState)

React.useEffect(() => {
  localStorage.setItem(key , value);
},[value]);

return [value, setValue];
};
const App = () => {
 
  // asynch data

  // const getAsyncStories = () =>
  // new Promise(resolve => 
  //   setTimeout(
  //     () => resolve({ data : {stories: initialStories}}),
  //     2000
  //   )
  // );

  // creating a custom hooks that groupe those two here !!

    /*  const [searchTerm, setSearchTerm] = 
      React.useState(localStorage.getItem('search') || 'React');
      //React.useState('');
      React.useEffect(() => {
        localStorage.setItem('search' , searchTerm);
      },[searchTerm]);*/

      
  

      const [searchTerm, setSearchTerm] = useSemiPersistentState('search', 'React');
      // const [stories, setStories] = React.useState([]);
      // new way using Redux, it contain 2 arguments the function and the initial state
      const [stories, dispatchStories] = React.useReducer(
        storiesReducer,
        {data: [], isLoading:false, isError:false}
      );
      
      const [url, setUrl] = React.useState(`${API_ENDPOINT}${searchTerm}`);
      // const [isLoading, setIsLoading] = React.useState(false);
      // const [isError, setIsError] = React.useState(false);
//memoization
 const handleFetchStories = React.useCallback(()=> {

  if(!searchTerm) return;
        dispatchStories({ type: 'STORIES_FETCH_INIT'});
        axios.get(url)
        //.then(response => response.json())
        .then(result =>
          {
            //the old way 
           // setStories(result.data.stories);
            // the new way
            dispatchStories({
              type: 'STORIES_FETCH_SUCCESS',
              payload: result.data.hits,
            });

            // setIsLoading(false);
          }).catch(() => dispatchStories({ type: 'STORIES_FETCH_FAILURE'}));

 },[url])

      // react useeffect related to the asynch
      React.useEffect(()=>{
       handleFetchStories()
      }, [handleFetchStories]);

      // remove function
      const handleRemoveStory = item => {
        const newStories = stories.data.filter(
          story => item.objectID !== story.objectID
        );
        //old way
        //setStories(newStories);
        dispatchStories({
          type: 'REMOVE_STORY',
          payload: item,
        });
      };


      const handleSearchInput = event => {
        setSearchTerm(event.target.value);
      };

      const handleSearchSubmit = () => {
        setUrl(`${API_ENDPOINT}${searchTerm}`)
      };
      // const handleChange = (event) => {
      //   const data=event.target.value;
      //   console.log(data);
      //   setSearchTerm(data);
      //   //localStorage('search', data);
      // };

    // const searchedStories = stories.data.filter(story =>
    //   story.title.toLowerCase().includes(searchTerm.toLowerCase())
    // );



    return (
        <div>
          <h1> My Hacker Stories </h1>

         {/* <Search search={searchTerm} onSearch={handleChange} />*/}
        
         <InputWithLabel 
         id="search" 
         value={searchTerm}
         onInputChange={handleSearchInput} >
           <strong> Search :</strong>
         
         </InputWithLabel> 

        <button
         type="button"
         disabled={!searchTerm}
         onClick={handleSearchSubmit}
         > Submit
         </button>
         <br></br>
         {/* display error msadg */}
         {stories.isError && <p> Something is wrong ...</p>}
         { stories.isLoading ? (<p>  Loading ....</p>):(
          <List list={stories.data} onRemoveItem={handleRemoveStory}/>)}
     
        </div>
       
    );
};

const InputWithLabel = ({
  id,
  value,
  type= 'text',
  onInputChange,
  isFocused,
  children,
}) => {
  //use ref is the new hook for the imperative react
  const inputRef = React.useRef();

  // focus option

  React.useEffect(() => {
    if (isFocused){
      inputRef.current.focus();
    }
  } , [isFocused]);

    return (
    <>
          <label htmlFor={id}> {children} </label>
          <input 
          ref={isFocused}
          id ={id} 
          type={type} 
          value={value} 
          onChange={onInputChange} 
          />  
         
   
    </>

    );
};


const List = ({list , onRemoveItem}) => 
    list.map((item) => (
         <Item 
         key={item.objectID} 
         item={item}
         onRemoveItem={onRemoveItem}/>
));

const Item = ({item , onRemoveItem}) => (
  <>
  <span>
    <a href={item.url}> {item.title}</a>
  </span>
  <span> {item.author} </span>
  <span> {item.num_comments} </span>
  <span> {item.points} </span>
  <span>
    <button type="button" onClick={() => onRemoveItem(item)}> Remove</button>
  </span>
  <br></br>
</>
);

export default App;
