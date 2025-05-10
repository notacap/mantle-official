import Link from 'next/link';
import Image from 'next/image';

function BlogPostItem({ post }) {
  if (!post) return null;

  const author = post._embedded?.author?.[0];
  const featuredMedia = post._embedded?.['wp:featuredmedia']?.[0];

  return (
    <Link href={`/blog/${post.slug}`} className="block group">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden h-full flex flex-col transform group-hover:scale-[1.03] transition-transform duration-300 ease-out">
        {featuredMedia?.source_url && (
          <div className="relative w-full h-48">
            <Image 
              src={featuredMedia.source_url} 
              alt={featuredMedia.alt_text || post.title.rendered} 
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:opacity-90 transition-opacity duration-300"
            />
          </div>
        )}
        <div className="p-5 md:p-6 flex flex-col flex-grow">
          <h3 
            className="text-lg md:text-xl font-semibold text-gray-900 group-hover:text-[#9CB24D] transition-colors mb-2 leading-tight line-clamp-2"
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />
          {author?.name && (
            <p className="text-xs text-gray-600 mb-2">
              By {author.name} &bull; {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
            </p>
          )}
          {post.excerpt?.rendered && (
            <div 
              className="text-gray-700 text-sm prose max-w-none mb-3 flex-grow line-clamp-3"
              dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
            />
          )}
          <span className="mt-auto inline-block text-sm font-medium text-[#9CB24D] group-hover:underline">
            Read more &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}

export default BlogPostItem; 