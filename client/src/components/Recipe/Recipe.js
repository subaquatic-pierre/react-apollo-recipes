import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { makeStyles } from '@material-ui/core'
import { useParams } from 'react-router-dom';
import {
    Typography,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemText,
    Button
} from '@material-ui/core';

import { GET_RECIPE } from '../../queries/getRecipe'
import { REMOVE_LIKE } from '../../mutations/removeLike'
import { ADD_LIKE } from '../../mutations/addLike'
import updateFavs from '../../updateCache/updateUserFavs';
import { removeRecipe, addRecipe, checkRecipeLiked, getFavourites } from '../../updateCache/helpers';
import handleLikeClick from '../../utils/handleLikeButtonClick'
import getUser from '../../auth/getUser'
import Loading from '../Loading'
import Error from '../Error'

const useStyles = makeStyles(theme => ({
    card: {
        margin: '1rem 0'
    },
    loading: {
        display: 'flex',
        justifyContent: 'center',
        height: '300px',
        alignItems: 'center'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        flexDirection: 'row'
    },
    likes: {
        padding: '0.5rem'
    }
}))

const Recipe = () => {
    const classes = useStyles()
    const client = useApolloClient()
    const user = getUser(client)

    // set initial state of liked to false, update in `useEffect` hook
    const [liked, setLiked] = useState(false)

    // create like and unlike mutations
    const [addLike] = useMutation(ADD_LIKE)
    const [removeLike] = useMutation(REMOVE_LIKE)

    // get recipe ID
    const params = useParams()
    const recipeId = params.id

    // make query to get recipe
    const { data, error, loading } = useQuery(GET_RECIPE,
        {
            variables: { id: recipeId },
        }
    )

    useEffect(() => {
        // get list of current user likes
        const favs = getFavourites(user)

        // check if recipe is in current user likes
        const checkIfLiked = checkRecipeLiked(favs, recipeId)

        // update state to reflect if user likes recipe
        setLiked(checkIfLiked)
    }, [user, liked, recipeId])

    if (loading) return <Loading />
    if (error) return <Error message={error.message} />

    return (
        <Card className={classes.card}>
            <CardContent>
                {data &&
                    <>
                        <div className={classes.header}>
                            <Typography aria-label='recipe-header' variant="h5" component="h2" >
                                {data.getRecipe.name}
                            </Typography>
                            <Typography aria-label='recipe-likes' className={classes.likes}>
                                Likes: {data.getRecipe.likes}
                            </Typography>
                        </div>
                        <List>
                            <ListItem>
                                <ListItemText
                                    primary="Category"
                                    secondary={data.getRecipe.category}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="Description"
                                    secondary={data.getRecipe.description}
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="Instructions"
                                    secondary={data.getRecipe.instructions} />
                            </ListItem>
                        </List>
                        {user &&
                            <>
                                <Button
                                    variant='contained'
                                    color='primary'
                                    aria-label='like-button'
                                    onClick={(id) => handleLikeClick(
                                        recipeId,
                                        {
                                            addLike,
                                            removeLike,
                                            liked,
                                            user
                                        })}>
                                    {liked ? <span>Liked</span> : <span>Like</span>}
                                </Button>
                            </>
                        }
                    </>
                }
            </CardContent>
        </Card>
    )
}

export default Recipe;