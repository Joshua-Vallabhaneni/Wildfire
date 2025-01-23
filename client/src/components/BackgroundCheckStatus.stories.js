import BackgroundCheckStatus from './BackgroundCheckStatus';

export default {
  component: BackgroundCheckStatus,
  title: 'Components/BackgroundCheckStatus',
};

export const Default = {
  args: {
    searchResults: {
      organic_results: [
        { link: 'https://linkedin.com/in/someone' },
        { link: 'https://github.com/someone' },
        { 
          link: 'https://news.com/article',
          snippet: 'Won an award for outstanding achievement'
        }
      ]
    }
  }
};

export const NoResults = {
  args: {
    searchResults: {
      organic_results: []
    }
  }
};