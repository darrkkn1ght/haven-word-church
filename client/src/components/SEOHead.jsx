import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';

const SEOHead = ({
  title,
  description,
  keywords,
  image,
  url,
  type,
  noIndex
}) => (
  <Helmet>
    {title && <title>{title}</title>}
    {description && <meta name="description" content={description} />}
    {keywords && <meta name="keywords" content={Array.isArray(keywords) ? keywords.join(', ') : keywords} />}
    {image && <meta property="og:image" content={image} />}
    {url && <meta property="og:url" content={url} />}
    {type && <meta property="og:type" content={type} />}
    {noIndex && <meta name="robots" content="noindex" />}
  </Helmet>
);

SEOHead.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  keywords: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string)
  ]),
  image: PropTypes.string,
  url: PropTypes.string,
  type: PropTypes.string,
  noIndex: PropTypes.bool
};

export default SEOHead;
