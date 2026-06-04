import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || process.env.PUBLIC_SANITY_PROJECT_ID || '',
    dataset: process.env.SANITY_STUDIO_DATASET || process.env.PUBLIC_SANITY_DATASET || 'production',
  },
  // Hosted studio URL: https://city-property-ahmedabad.sanity.studio
  studioHost: 'city-property-ahmedabad',
});
