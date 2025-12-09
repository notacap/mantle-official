import { Suspense } from 'react';
import Link from 'next/link';
import FeaturedBlogPost from '@/app/components/blog/FeaturedBlogPost';
import BlogPostItem from '@/app/components/blog/BlogPostItem';
import BlogLoadingSkeleton from './loading'; // Will use the loading.js file
import NewsletterSignup from '@/app/components/NewsletterSignup'; // Added import

export const metadata = {
  title: 'Blog - Tactical Gear Insights & Product Updates | Mantle Clothing',
  description: 'Expert insights on tactical clothing, gear reviews, product updates, and field-tested advice for law enforcement and first responders. Stay informed with Mantle.',
  keywords: 'tactical gear blog, law enforcement clothing tips, police gear reviews, tactical apparel insights, first responder equipment, mantle clothing updates, range-tested gear advice, tactical clothing care',
  openGraph: {
    title: 'Mantle Clothing Blog - Gear Insights from the Field',
    description: 'Real-world tactical gear insights, product deep dives, and professional tips from 200+ days on the range. Written by cops, for cops.',
    type: 'website',
    locale: 'en_US',
    url: 'https://www.mantle-clothing.com/blog',
    siteName: 'Mantle Clothing',
    images: [
      {
        url: '/images/banner-1.jpg',
        width: 1200,
        height: 630,
        alt: 'Mantle Clothing - Sustainable Apparel',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog - Tactical Gear Insights | Mantle Clothing',
    description: 'Expert insights on tactical clothing and gear. Field-tested advice for law enforcement professionals.',
    images: ['/images/banner-1.jpg'],
  },
  alternates: {
    canonical: 'https://www.mantle-clothing.com/blog',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

async function fetchPosts() {
  const baseUrl = `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json`;
  // console.log('Attempting to fetch posts from hardcoded baseUrl:', baseUrl);

  const fetchUrl = `${baseUrl}/wp/v2/posts?_embed&orderby=date&order=desc`;
  // console.log('Fetching URL:', fetchUrl);

  const response = await fetch(fetchUrl, {
    next: { revalidate: 3600 } // Revalidate every hour
  });

  if (!response.ok) {
    // console.error('Failed to fetch posts. Status:', response.status, response.statusText);
    // const errorBody = await response.text();
    // console.error('Error body:', errorBody);
    throw new Error('Failed to fetch posts');
  }
  return response.json();
}

export default async function BlogPage() {
  const posts = await fetchPosts();

  const featuredPost = posts.length > 0 ? posts[0] : null;
  const otherPosts = posts.length > 1 ? posts.slice(1) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-12 text-center">
        Our Blog
      </h1>

      <Suspense fallback={<BlogLoadingSkeleton />}>
        {featuredPost && (
          <div className="mb-16">
            <FeaturedBlogPost post={featuredPost} />
          </div>
        )}

        {otherPosts.length > 0 && (
          <div>
            <h2 className="text-3xl font-semibold text-gray-900 mb-8 text-center">
              More Posts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {otherPosts.map((post) => (
                <BlogPostItem key={post.id} post={post} />
              ))}
            </div>
          </div>
        )}

        {!posts.length && (
          <div className="text-center text-gray-500 py-10">
            <p className="text-xl">No blog posts found at the moment.</p>
            <p>Please check back later!</p>
          </div>
        )}
      </Suspense>
      <NewsletterSignup />
    </div>
  );
} 