<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\ArticleResource;
use App\Models\Article;

class ArticleController extends Controller
{
    /**
     * GET /api/v1/articles
     */
    public function index()
    {
        $articles = Article::where('status', 0)
            ->orderByDesc('id')
            ->paginate(12);

        return ArticleResource::collection($articles);
    }

    /**
     * GET /api/v1/articles/{slug}
     */
    public function show(string $slug)
    {
        $article = Article::where('slug', $slug)
            ->where('status', 0)
            ->firstOrFail();

        return response()->json(['data' => new ArticleResource($article)]);
    }
}
