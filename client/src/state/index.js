import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    mode: 'light',
    user: null,
    token: null,
    posts: [],
    friends: [],
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setMode: (state) => {
            state.mode = state.mode === 'light' ? 'dark' : 'light';
        },
        setLogin: (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
        },
        setLogout: (state) => {
            state.user = null;
            state.token = null;
        },
        setFriends: (state, action) => {
            if (state.user) {
                state.user.friends = Array.isArray(action.payload.friends)
                    ? action.payload.friends
                    : [];
            } else {
                console.error('User friends non-existent :(');
            }
        },
        setPosts: (state, action) => {
            state.posts = action.payload.posts;
        },
        setPost: (state, action) => { 
            const updatedPosts = state.posts.map((post) => {
                if (post._id === action.payload.post._id) {
                    return action.payload.post;
                }
                return post;
            });
            state.posts = updatedPosts;
        },
        removePost: (state, action) => {
            state.posts = state.posts.filter(post => post._id !== action.payload.postId);
            },
        restorePost: (state, action) => {
            state.posts.unshift(action.payload.post); // add post back at the top
            },
    }
});

export const { setMode, setLogin, setLogout, setFriends, setPosts, setPost, removePost, restorePost } = authSlice.actions;
export default authSlice.reducer;