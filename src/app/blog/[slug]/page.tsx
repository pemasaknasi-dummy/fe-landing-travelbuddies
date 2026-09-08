import { Metadata } from "next";
import { marked } from "marked";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, MapPin, Check, Bookmark, Share2, Sparkles, Eye } from "lucide-react";
import { notFound } from "next/navigation";

// Define the API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3010/api";

interface Article {
  id: number;
  title: string;
  slug: string;
  category: string;
  location: string;
  writtenDate?: string;
  readTime?: string;
  image: string;
  shortDesc: string;
  content: string;
  highlights: string[];
  statusPublish: string;
  viewCount?: number;
}

// Fetch helper on Server
async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const res = await fetch(`${API_URL}/articles/slug/${slug}`, {
      next: { revalidate: 60 }, // Cache for 60 seconds
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Error fetching article by slug:", error);
    return null;
  }
}

// SEO Metadata Generation (Next.js 16 compliant async params)
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const article = await getArticleBySlug(resolvedParams.slug);

  if (!article) {
    return {
      title: "Artikel Tidak Ditemukan - TravelBuddies",
      description: "Halaman artikel yang Anda cari tidak ditemukan.",
    };
  }

  return {
    title: `${article.title} - TravelBuddies Blog`,
    description: article.shortDesc,
    openGraph: {
      title: article.title,
      description: article.shortDesc,
      images: [{ url: article.image }],
      type: "article",
    },
  };
}

export default async function ArticleDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const article = await getArticleBySlug(resolvedParams.slug);

  const isPreview = resolvedSearchParams.preview === "true";

  if (!article || (!isPreview && article.statusPublish !== "published")) {
    notFound();
  }

  // Parse markdown content to HTML on the server
  const parsedContent = await marked.parse(article.content);

  return (
    <div className="bg-white min-h-screen pb-24">
      {isPreview && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-800 text-center py-3 font-semibold text-sm sticky top-0 z-50 flex items-center justify-center gap-2">
          <span>⚠️ Pratonton Artikel: Status "{article.statusPublish.toUpperCase()}"</span>
        </div>
      )}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        
        {/* Navigation & Action Buttons */}
        <div className="flex justify-between items-center mb-10">
          <Link
            href="/blog"
            className="text-slate-500 flex items-center gap-2 hover:text-blue-600 transition-colors font-medium text-sm group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Kembali ke Blog</span>
          </Link>
          {/* Save & Share Button */}
          {/* <div className="flex gap-3">
            <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors border border-slate-100 cursor-pointer">
              <Bookmark className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors border border-slate-100 cursor-pointer">
              <Share2 className="w-5 h-5" />
            </button>
          </div> */}
        </div>

        {/* Article Header */}
        <div className="mb-8 max-w-3xl mx-auto text-center space-y-4">
          <div className="flex items-center justify-center">
            <span className="px-3.5 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold uppercase tracking-wider">
              {article.category}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-500 text-sm py-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
                TB
              </div>
              <div className="text-left">
                <p className="font-bold text-slate-800">Tim TravelBuddies</p>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  {article.writtenDate && <span>{article.writtenDate}</span>}
                  {article.writtenDate && article.readTime && <span>&bull;</span>}
                  {article.readTime && <span>{article.readTime}</span>}
                  {(article.writtenDate || article.readTime) && <span>&bull;</span>}
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{article.viewCount ?? 0} kali dilihat</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Cover Image */}
        <div className="w-full mb-12">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-[300px] md:h-[500px] object-cover rounded-3xl shadow-sm"
          />
          <p className="text-center text-xs text-slate-400 mt-3 italic flex items-center justify-center gap-1.5">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span>{article.location}</span>
          </p>
        </div>

        {/* Article Body */}
        <div className="max-w-3xl mx-auto">
          {/* Highlights Box */}
          {article.highlights && article.highlights.length > 0 && (
            <div className="bg-slate-50 rounded-2xl p-6 mb-10 border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <span>Sorotan Destinasi</span>
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700">
                {article.highlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* HTML & Markdown rendered Content */}
          <article
            className="html-content text-slate-700 leading-relaxed max-w-none text-justify"
            dangerouslySetInnerHTML={{ __html: parsedContent }}
          />

          {/* Tags Footer */}
          <div className="mt-12 pt-8 border-t border-slate-100 flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-800">Tag:</span>
            <span className="px-3.5 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs hover:bg-slate-200 cursor-pointer transition-colors">
              Travel
            </span>
            <span className="px-3.5 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs hover:bg-slate-200 cursor-pointer transition-colors">
              Inspirasi
            </span>
            <span className="px-3.5 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs hover:bg-slate-200 cursor-pointer transition-colors">
              Nusantara
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
