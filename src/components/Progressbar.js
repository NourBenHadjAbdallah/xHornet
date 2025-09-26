import React from 'react';
import PropTypes from 'prop-types';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

function CircularProgressWithLabel(props) {
  const { value, statusText } = props;

  return (
    <Box position="relative" display="inline-flex">
      <CircularProgress
        size="30vh"
        variant={value >= 0 && value <= 100 ? 'determinate' : 'indeterminate'}
        value={value}
      />
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
        <Typography variant="h4" component="div" color="textSecondary">
          {value >= 0 && value <= 100 ? `${Math.round(value)}%` : 'En cours'}
        </Typography>
      </Box>
      {statusText && (
        <Box mt={2} textAlign="center">
          <Typography variant="body1" component="div" color="textSecondary">
            {statusText}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

CircularProgressWithLabel.propTypes = {
  /**
   * The value of the progress indicator for the determinate variant.
   * Value between 0 and 100.
   */
  value: PropTypes.number.isRequired,
  /**
   * Optional text to display below the progress bar (e.g., processing status).
   */
  statusText: PropTypes.string,
};

export default function CircularStatic(props) {
  return <CircularProgressWithLabel {...props} />;
}