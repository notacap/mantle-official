import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import BreadcrumbsJsonLd from '@/app/components/seo/BreadcrumbsJsonLd';
import { SITE_URL, SITE_NAME, decodeEntities, htmlToText, truncate, jsonLdString } from '@/app/lib/seo';
import SinglePostLoadingSkeleton from './loading'; // Will use the sibling loading.js

// Function to fetch a single post by its slug
// WordPress API often allows fetching by slug directly. If not, we might need to fetch all and filter, or use an ID if available.
// Assuming /wp/v2/posts?slug=<slug_here>&_embed will work.
async function getPost(slug) {
  const baseUrl = `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json`;

  const fetchUrl = `${baseUrl}/wp/v2/posts?slug=${slug}&_embed`;

  const response = await fetch(fetchUrl, {
    next: { revalidate: 3600 } // Revalidate every hour
  });
  if (!response.ok) {
    // console.error('Failed to fetch single post. Status:', response.status, response.statusText);
    // const errorBody = await response.text();
    // console.error('Single post error body:', errorBody);
    throw new Error('Failed to fetch post'); 
  }
  const posts = await response.json();
  if (posts.length === 0) {
    return null;
  }
  return posts[0]; // The API returns an array even for a single slug match
}

// Recommended: Generate static paths if you have a fixed set of blog posts or want to pre-render them
// export async function generateStaticParams() {
//   const baseUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;
//   const response = await fetch(`${baseUrl}/wp/v2/posts?_fields=slug`);
//   const posts = await response.json();
//   return posts.map((post) => ({
//     slug: post.slug,
//   }));
// }

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPost(slug).catch(() => null);
  const url = `${SITE_URL}/blog/${slug}`;

  if (!post) {
    return {
      title: 'Post Not Found | Mantle Clothing',
      robots: { index: false, follow: true },
      alternates: { canonical: url },
    };
  }

  const yoast = post.yoast_head_json || {};
  const title = decodeEntities(htmlToText(post.title?.rendered));
  const description = truncate(
    htmlToText(yoast.description) ||
      htmlToText(post.excerpt?.rendered) ||
      htmlToText(post.content?.rendered)
  );
  const featuredMedia = post._embedded?.['wp:featuredmedia']?.[0];
  const author = post._embedded?.author?.[0];
  const images = featuredMedia?.source_url
    ? [{
        url: featuredMedia.source_url,
        width: featuredMedia.media_details?.width,
        height: featuredMedia.media_details?.height,
        alt: featuredMedia.alt_text || title,
      }]
    : undefined;

  return {
    title: `${title} | ${SITE_NAME} Blog`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: 'article',
      locale: 'en_US',
      publishedTime: post.date_gmt ? `${post.date_gmt}Z` : undefined,
      modifiedTime: post.modified_gmt ? `${post.modified_gmt}Z` : undefined,
      authors: author?.name ? [author.name] : undefined,
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: images?.map((img) => img.url),
    },
  };
}

export default async function SinglePostPage({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const author = post._embedded?.author?.[0];
  const featuredMedia = post._embedded?.['wp:featuredmedia']?.[0];

  // Decode HTML entities from WordPress
  function decodeHtmlEntities(text) {
    const entities = {
      '&#8211;': '\u2013', // en-dash
      '&#8212;': '\u2014', // em-dash
      '&#8216;': '\u2018', // left single quote
      '&#8217;': '\u2019', // right single quote
      '&#8220;': '\u201C', // left double quote
      '&#8221;': '\u201D', // right double quote
      '&#038;': '&',
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'",
    };
    return text.replace(/&#?\w+;/g, entity => entities[entity] || entity);
  }

  // Basic breadcrumbs - can be enhanced
  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Blog', href: '/blog' },
    { name: decodeHtmlEntities(post.title.rendered), href: `/blog/${post.slug}` },
  ];

  const breadcrumbJsonLdItems = breadcrumbs.map((b) => ({
    name: b.name,
    url: `${SITE_URL}${b.href}`,
  }));

  const postTitle = decodeEntities(htmlToText(post.title.rendered));
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${SITE_URL}/blog/${post.slug}#article`,
    headline: postTitle,
    description: truncate(htmlToText(post.excerpt?.rendered) || htmlToText(post.content?.rendered), 300) || undefined,
    image: featuredMedia?.source_url ? [featuredMedia.source_url] : undefined,
    datePublished: post.date_gmt ? `${post.date_gmt}Z` : undefined,
    dateModified: post.modified_gmt ? `${post.modified_gmt}Z` : undefined,
    author: author?.name
      ? { '@type': 'Person', name: author.name }
      : { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    publisher: { '@id': `${SITE_URL}/#organization` },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <BreadcrumbsJsonLd items={breadcrumbJsonLdItems} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(articleJsonLd) }}
      />
      <Suspense fallback={<SinglePostLoadingSkeleton />}>
        <article>
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol role="list" className="flex items-center space-x-2 text-sm text-gray-500">
              {breadcrumbs.map((breadcrumb, index) => (
                <li key={breadcrumb.name}>
                  <div className="flex items-center">
                    {index > 0 && (
                      <svg className="flex-shrink-0 h-5 w-5 text-gray-300 mr-2" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                      </svg>
                    )}
                    <Link href={breadcrumb.href} className="hover:text-[#9CB24D] transition-colors">
                      {index === breadcrumbs.length - 1 ? (
                        <span className="font-medium text-gray-700">{breadcrumb.name}</span>
                      ) : (
                        breadcrumb.name
                      )}
                    </Link>
                  </div>
                </li>
              ))}
            </ol>
          </nav>

          {/* Post Header */}
          <header className="mb-8">
            <h1 
              className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-4 leading-tight"
              dangerouslySetInnerHTML={{ __html: post.title.rendered }}
            />
            <div className="text-gray-600 text-sm">
              <span>Published on {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              {author && <span> by {author.name}</span>}
            </div>
          </header>

          {/* Featured Image */}
          {featuredMedia && (
            <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
              <Image 
                src={featuredMedia.source_url}
                alt={featuredMedia.alt_text || post.title.rendered}
                width={featuredMedia.media_details.width}
                height={featuredMedia.media_details.height}
                className="w-full h-auto object-cover"
                priority // Prioritize loading for LCP
              />
            </div>
          )}

          {/* Post Content */}
          <div
            className="blog-content prose prose-lg max-w-none text-gray-800 prose-headings:text-gray-900 prose-a:text-[#9CB24D] hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: post.content.rendered }}
          />

        </article>
      </Suspense>
    </div>
  );
} 