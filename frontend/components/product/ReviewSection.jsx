"use client";

import { useMemo, useState } from "react";
import { HiStar, HiOutlineStar } from "react-icons/hi2";

import api from "@/utils/axios";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

const clampRating = (v) => Math.max(0, Math.min(5, Number(v || 0)));

function Stars({ rating = 0, size = "md" }) {
  const r = clampRating(rating);
  const filled = Math.round(r);
  const cls = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating ${r} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) =>
        i < filled ? (
          <HiStar key={i} className={`${cls} text-amber-500`} />
        ) : (
          <HiOutlineStar key={i} className={`${cls} text-neutral-800/40`} />
        )
      )}
    </div>
  );
}

export default function ReviewSection({ productId, reviews = [], ratings = 0, numReviews = 0 }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const list = useMemo(() => reviews || [], [reviews]);

  const submit = async () => {
    setIsSubmitting(true);
    try {
      await api.post("/reviews", { productId, rating, comment });
      setOpen(false);
      setComment("");
      setRating(5);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-2xl border bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-display text-2xl font-bold text-primary">
              {Number(ratings || 0).toFixed(1)}
            </span>
            <Stars rating={ratings} />
            <span className="text-sm text-neutral-800/70">
              ({numReviews || list.length} reviews)
            </span>
          </div>
        </div>

        <Button variant="outline" onClick={() => setOpen(true)}>
          Write a Review
        </Button>
      </div>

      <div className="mt-5 grid gap-4">
        {list.length === 0 ? (
          <p className="text-sm text-neutral-800">No reviews yet.</p>
        ) : (
          list.map((r, idx) => (
            <div key={r._id || idx} className="rounded-xl border p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-primary">{r.user?.name || "User"}</p>
                  <p className="mt-0.5 text-xs text-neutral-800/70">
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}
                  </p>
                </div>
                <Stars rating={r.rating} size="sm" />
              </div>
              {r.comment ? <p className="mt-3 text-sm text-neutral-800">{r.comment}</p> : null}
            </div>
          ))
        )}
      </div>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Write a Review">
        <div className="grid gap-4">
          <div>
            <p className="mb-2 text-sm font-medium text-primary">Rating</p>
            <div className="flex items-center gap-2">
              {Array.from({ length: 5 }).map((_, i) => {
                const val = i + 1;
                const active = val <= rating;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setRating(val)}
                    className="rounded-md bg-black p-1 hover:bg-neutral-900"
                    aria-label={`Set rating ${val}`}
                  >
                    {active ? (
                      <HiStar className="h-6 w-6 text-amber-500" />
                    ) : (
                      <HiOutlineStar className="h-6 w-6 text-neutral-800/40" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-primary">Comment</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-neutral-100 bg-neutral-50 px-4 py-3 outline-none transition duration-200 focus:ring-2 focus:ring-primary"
              placeholder="Write your review..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button isLoading={isSubmitting} onClick={submit} disabled={!productId}>
              Submit Review
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
