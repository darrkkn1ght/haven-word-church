import React, { useState } from 'react';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Mail, 
  Share2, 
  Copy,
  Check
} from 'lucide-react';

const SocialShare = ({ 
  title, 
  description, 
  url, 
  image, 
  hashtags = ['HavenWordChurch', 'Church', 'Faith'],
  platforms = ['facebook', 'twitter', 'whatsapp', 'email', 'copy']
}) => {
  const [copied, setCopied] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const shareData = {
    title: title || 'Haven Word Church',
    description: description || 'Join us in spreading God\'s Word and building His Kingdom',
    url: url || window.location.href,
    image: image || '/logo.jpeg',
    hashtags: hashtags.join(' ')
  };

  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}&quote=${encodeURIComponent(shareData.title)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.title)}&url=${encodeURIComponent(shareData.url)}&hashtags=${encodeURIComponent(shareData.hashtags)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareData.title} ${shareData.url}`)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}`,
    email: `mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(`${shareData.description}\n\n${shareData.url}`)}`,
    instagram: `https://www.instagram.com/` // Instagram doesn't support direct sharing via URL
  };

  const handleShare = (platform) => {
    if (platform === 'copy') {
      navigator.clipboard.writeText(shareData.url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
      return;
    }

    if (platform === 'native') {
      if (navigator.share) {
        navigator.share({
          title: shareData.title,
          text: shareData.description,
          url: shareData.url
        });
        return;
      }
    }

    const shareUrl = shareUrls[platform];
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'facebook':
        return <Facebook className="w-5 h-5" />;
      case 'twitter':
        return <Twitter className="w-5 h-5" />;
      case 'whatsapp':
        return <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center">
          <span className="text-white text-xs font-bold">WA</span>
        </div>;
      case 'linkedin':
        return <Linkedin className="w-5 h-5" />;
      case 'instagram':
        return <Instagram className="w-5 h-5" />;
      case 'email':
        return <Mail className="w-5 h-5" />;
      case 'copy':
        return copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />;
      case 'native':
        return <Share2 className="w-5 h-5" />;
      default:
        return <Share2 className="w-5 h-5" />;
    }
  };

  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'facebook':
        return 'hover:bg-blue-600 hover:text-white';
      case 'twitter':
        return 'hover:bg-blue-400 hover:text-white';
      case 'whatsapp':
        return 'hover:bg-green-500 hover:text-white';
      case 'linkedin':
        return 'hover:bg-blue-700 hover:text-white';
      case 'instagram':
        return 'hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white';
      case 'email':
        return 'hover:bg-gray-600 hover:text-white';
      case 'copy':
        return copied ? 'bg-green-500 text-white' : 'hover:bg-gray-600 hover:text-white';
      case 'native':
        return 'hover:bg-blue-500 hover:text-white';
      default:
        return 'hover:bg-gray-600 hover:text-white';
    }
  };

  const getPlatformName = (platform) => {
    switch (platform) {
      case 'facebook':
        return 'Facebook';
      case 'twitter':
        return 'Twitter';
      case 'whatsapp':
        return 'WhatsApp';
      case 'linkedin':
        return 'LinkedIn';
      case 'instagram':
        return 'Instagram';
      case 'email':
        return 'Email';
      case 'copy':
        return copied ? 'Copied!' : 'Copy Link';
      case 'native':
        return 'Share';
      default:
        return platform;
    }
  };

  // Show native share if available and not in the platforms list
  const shouldShowNative = navigator.share && !platforms.includes('native');

  const allPlatforms = shouldShowNative ? ['native', ...platforms] : platforms;
  const visiblePlatforms = showAll ? allPlatforms : allPlatforms.slice(0, 4);

  return (
    <div className="social-share">
      <div className="flex flex-wrap items-center gap-2">
        {visiblePlatforms.map((platform) => (
          <button
            key={platform}
            onClick={() => handleShare(platform)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-gray-700 bg-gray-100 ${getPlatformColor(platform)}`}
            title={`Share on ${getPlatformName(platform)}`}
          >
            {getPlatformIcon(platform)}
            <span className="text-sm font-medium">{getPlatformName(platform)}</span>
          </button>
        ))}
        
        {allPlatforms.length > 4 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-gray-700 bg-gray-100 hover:bg-gray-200"
          >
            <Share2 className="w-5 h-5" />
            <span className="text-sm font-medium">
              {showAll ? 'Show Less' : `+${allPlatforms.length - 4} More`}
            </span>
          </button>
        )}
      </div>

      {/* Share preview */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-2">Share Preview:</h4>
        <div className="text-sm text-gray-600">
          <p><strong>Title:</strong> {shareData.title}</p>
          <p><strong>Description:</strong> {shareData.description}</p>
          <p><strong>URL:</strong> <span className="break-all">{shareData.url}</span></p>
        </div>
      </div>
    </div>
  );
};

export default SocialShare; 