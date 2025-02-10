import React from 'react';

import PropTypes from 'prop-types';

import CircularProgress from '@material-ui/core/CircularProgress';

import Typography from '@material-ui/core/Typography';

import Box from '@material-ui/core/Box';



function CircularProgressWithLabel(props) {

  return (

    <Box position="relative" display="inline-flex">

      {props.value === 100? <CircularProgress size={'30vh'} variant="determinate" value={100} />

:<CircularProgress size={'30vh'}  />}

      <Box

        top={0}

        left={0}

        bottom={0}

        right={0}

        position="absolute"

        display="flex"

        alignItems="center"

        justifyContent="center"

      >

        <Typography variant="h4" component="div" color="textSecondary">{props.value === 100 ?'100%':'en cours'}</Typography>

      </Box>

    </Box>

  );

}



CircularProgressWithLabel.propTypes = {

  /**

   * The value of the progress indicator for the determinate variant.

   * Value between 0 and 100.

   */

  value: PropTypes.number.isRequired,

};



export default function CircularStatic(props) {

  return <CircularProgressWithLabel value={props.value} />;

}