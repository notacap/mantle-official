import Link from 'next/link';
import Image from 'next/image';

function FeaturedBlogPost({ post }) {
  if (!post) return null;

  const author = post._embedded?.author?.[0];
  const featuredMedia = post._embedded?.['wp:featuredmedia']?.[0];

  return (
    <Link href={`/blog/${post.slug}`} className="block group">
      <div className="bg-white shadow-xl rounded-lg overflow-hidden transform group-hover:scale-[1.02] transition-transform duration-300 ease-out">
        {featuredMedia?.source_url && (
          <div className="relative w-full h-96 lg:h-[500px]">
            <Image 
              src={featuredMedia.source_url} 
              alt={featuredMedia.alt_text || post.title.rendered} 
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:opacity-90 transition-opacity duration-300"
              priority
            />
          </div>
        )}
        <div className="p-6 md:p-8">
          <h2 
            className="text-2xl md:text-3xl font-bold text-gray-900 group-hover:text-[#9CB24D] transition-colors mb-3 leading-tight"
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />
          {author?.name && (
            <p className="text-sm text-gray-600 mb-3">
              By {author.name} &bull; {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          )}
          {post.excerpt?.rendered && (
            <div 
              className="text-gray-700 prose prose-lg max-w-none mb-4 line-clamp-3"
              dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
            />
          )}
          <span className="mt-4 inline-block font-semibold text-[#9CB24D] group-hover:underline">
            Read more &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}

export default FeaturedBlogPost; 