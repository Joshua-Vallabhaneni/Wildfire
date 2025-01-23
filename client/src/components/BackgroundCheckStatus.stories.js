import BackgroundCheckStatus from './BackgroundCheckStatus';

export default {
  component: BackgroundCheckStatus,
  title: 'Components/BackgroundCheckStatus',
};

// Successful check with both indicators positive
export const FullyVerified = {
  args: {
    searchResults: {
      resultsFound: 15,
      hasTrustedPresence: true
    }
  }
};

// Some online presence but no trusted platforms
export const PartiallyVerified = {
  args: {
    searchResults: {
      resultsFound: 5,
      hasTrustedPresence: false
    }
  }
};

// No verification success
export const NotVerified = {
  args: {
    searchResults: {
      resultsFound: 0,
      hasTrustedPresence: false
    }
  }
};

// Loading or error state
export const NoResults = {
  args: {
    searchResults: null
  }
};