import React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import Link from '@mui/material/Link';

const RelevantFacts = (props) => {
  const onButtonTwoClick = () => {
    props.checkClaim()
  }

    return (
    <>
    <Typography variant="h4" gutterBottom component="div">
        Relevant Claims
      </Typography>
      {props.buttonTwoVisible && <><Typography variant="subtitle2" gutterBottom component="div">
        <Link onClick={onButtonTwoClick} underline="hover" style={{"cursor":"pointer"}}>
          Couldn't find what you were looking for? Click here.
        </Link>
      </Typography><br/><br/></>}
      
      <List sx={{ width: '100%', bgcolor: 'background.paper' }} >

        {props.facts.map(fact=>fact.claimReview[0].languageCode === "en" && <React.Fragment key={uuidv4()}><ListItem alignItems="flex-start" key={uuidv4()}>
          <ListItemAvatar>
            <Avatar alt={fact.claimant} src="#" />
          </ListItemAvatar>
          <ListItemText
            primary={fact.claimant ? "Claim by " + fact.claimant +" :": "Claim :"}
            secondary={
              <React.Fragment>
                {fact.text}
                <br /><br />
                {fact.claimReview.length > 0 && fact.claimReview.map(review =>
                <React.Fragment key={uuidv4()}>
                  <Typography
                  sx={{ display: 'inline' }}
                  component="span"
                  variant="subtitle2"
                  color="text.primary"
                  key={uuidv4()}>
                    {review.publisher.name}
                  </Typography>
                  {"      "} <span style={{
                    display: "inline-block",
                    padding: "2px 10px",
                    fontSize: "13px",
                    borderRadius: "25px",
                    backgroundColor: review.textualRating.toLowerCase().includes("true") ? "#77dd77": '#ff6961',
                    color:"white"
                  }}>
                    {review.textualRating}
                  </span>
                  <br />

                  <Typography
                  sx={{ display: 'inline' }}
                  component="span"
                  variant="body2"
                  color="text.primary"
                  key={uuidv4()}>
                    <Link href={review.url} underline="hover" key={uuidv4()} >
                      {review.title}
                    </Link>
                  </Typography>
                  <br />

                  <Typography
                  sx={{ display: 'inline' }}
                  component="span"
                  variant="caption"
                  color="text.primary"
                  key={uuidv4()}>
                  {moment(fact.claimDate).format('MMM D, YYYY')}
                  </Typography>
                
                </React.Fragment>)}
              </React.Fragment>
            }
          />
        </ListItem>
        <Divider variant="inset" component="li" />
        </React.Fragment>)
        }
      </List>
    </>
  );
}

export default RelevantFacts;