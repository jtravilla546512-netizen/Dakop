<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            // nullOnDelete keeps the report visible even if the reporter deletes their account
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('barangay_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['hpg', 'lto']);
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->text('description')->nullable();
            // expires_at is extended by 30 min each time someone confirms "still here"
            $table->timestamp('expires_at');
            $table->unsignedInteger('still_here_count')->default(0);
            $table->unsignedInteger('no_longer_here_count')->default(0);
            $table->timestamps();

            $table->index('expires_at');
            $table->index('barangay_id');
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
