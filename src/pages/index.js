import React, { useState } from "react"
import Helmet from 'react-helmet';
import { Marker, Popup } from 'react-leaflet';
import { graphql } from 'gatsby'
import Layout from "../components/layout"
import Post from "../components/post"
import Map from '../components/Map';

const DEFAULT_CENTER = [35.056870, -89.692315];

function filterEdgesByCategory(edges, category) {
  if (category === 'All' || category === null) {
    return edges.filter(edge => edge.node.frontmatter.title)
  }
  return edges.filter(edge => edge.node.frontmatter.title && edge.node.frontmatter.category === category)
}

const Posts = ({edges, category}) => {
  let posts = filterEdgesByCategory(edges, category)
  return posts.map(edge => <Post key={edge.node.id} post={edge.node} />)
}

const IndexPage = ({
  data: {
    site,
    allMarkdownRemark: { edges },
  },
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const buttons = ['All', 'Local', 'Regional Chain', 'National Chain'].map( key => {
    return <button onClick={() => setSelectedCategory(key)} className={`button -primary ${key === selectedCategory ? 'active' : ''}`}>{key}</button>
  });

  let restaurants = filterEdgesByCategory(edges, selectedCategory);

  restaurants = restaurants.map(({ node = {} } = {}) => {
    const { frontmatter = {}, id } = node;
    return {
      id,
      ...frontmatter
    };
  });

  restaurants = restaurants.filter(({ location } = {}) => !!location);

  return (
    <Layout>
      <Helmet>
        <title>{site.siteMetadata.title}</title>
        <meta name="description" content={site.siteMetadata.description} />
      </Helmet>
      <div className="button-row">
        {buttons}
      </div>
      <h2>Restaurants:</h2>
      <Map center={DEFAULT_CENTER} zoom={12}>
        { restaurants.map(restaurant => {
          const { title, services, tags, website, location, id } = restaurant;
          const locationSplit = location.split(',').map(i => i.trim());
          const center = [locationSplit[0], locationSplit[1]];
          return (
            <Marker key={id} position={center}>
              <Popup>
                <h3>
                  { title }
                </h3>
                <ul>
                  <li>
                    { services }
                  </li>
                  <li>
                    { tags }
                  </li>
                  <li>
                    <a href={website}>Website</a>
                  </li>
                </ul>
              </Popup>
            </Marker>
          )
        })}
      </Map>
      <div className="grids">
        <Posts edges={edges} category={selectedCategory} />
      </div>
    </Layout>
  )
}

export default IndexPage
export const pageQuery = graphql`
  query indexPageQuery {
    site {
      siteMetadata {
        title
        description
      }
    }
    allMarkdownRemark(sort: { order: ASC, fields: [frontmatter___title] }) {
      edges {
        node {
          id
          frontmatter {
            title
            phone
            tags
            category
            website
            services
            location
          }
        }
      }
    }
  }
`