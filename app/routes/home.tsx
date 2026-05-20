import type { Route } from "./+types/home";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button, Input } from "@heroui/react";
import { MapPin, Users, Link as LinkIcon, Check, Sparkles, Rocket } from "lucide-react";
import { AppHeader } from "../components/app-header";
import { CategoryPin } from "../components/category-pin";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "wanna-go - 行きたい場所を家族・恋人と共有しよう" },
    { name: "description", content: "アカウント不要でURLで簡単共有。地図で場所を確認できる行きたい場所管理アプリ" },
  ];
}

export default function Home() {
  const [groupId, setGroupId] = useState("");
  const navigate = useNavigate();

  const handleJoinGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (groupId.trim()) {
      navigate(`/group/${groupId.trim()}`);
    }
  };

  return (
    <>
      <AppHeader homeLink={false} />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Hero Section */}
          <section className="text-center mb-16 relative">
            {/* 装飾ピン */}
            <div
              className="absolute -top-2 left-8 hidden sm:block opacity-70"
              aria-hidden="true"
            >
              <CategoryPin category="観光地" size={28} />
            </div>
            <div
              className="absolute top-12 right-6 hidden sm:block opacity-70 rotate-12"
              aria-hidden="true"
            >
              <CategoryPin category="レストラン" size={26} />
            </div>

            <div className="space-y-3 mb-10 pt-10">
              <p className="font-serif-jp text-deep-sea-ink/70 dark:text-parchment/70 tracking-[0.18em] text-sm">
                WANNA-GO
              </p>
              <h1 className="font-display text-5xl sm:text-6xl text-deep-sea dark:text-parchment leading-tight">
                行きたい場所を、
                <br className="hidden sm:block" />
                みんなで共有しよう
              </h1>
              <p className="text-lg text-deep-sea-ink/75 dark:text-parchment/75 mt-6 max-w-2xl mx-auto leading-relaxed">
                アカウント不要、URL ひとつ。お気に入りの場所を持ち寄って、
                家族・恋人・友人とゆっくり計画できます。
              </p>
            </div>

            {/* Primary CTA */}
            <div className="mb-4">
              <Button
                as={Link}
                to="/create"
                color="primary"
                size="lg"
                className="text-lg px-10 py-7 shadow-paper hover:shadow-paper-hover transition-all duration-300"
                startContent={<Sparkles size={20} />}
              >
                新しいグループを作成
              </Button>
            </div>
          </section>

          {/* Cards Section */}
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {/* Join group card */}
            <div className="paper-card p-6">
              <h3 className="font-display text-xl text-deep-sea dark:text-parchment mb-1">
                既存グループに参加
              </h3>
              <p className="text-sm text-deep-sea-ink/70 dark:text-parchment/70 mb-4 font-serif-jp">
                グループIDを入力してメンバーに加わりましょう
              </p>
              <form onSubmit={handleJoinGroup} className="space-y-3">
                <Input
                  type="text"
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                  placeholder="例: xy7k9m2p"
                  maxLength={8}
                  variant="bordered"
                  classNames={{
                    input: "font-mono tracking-wider",
                    inputWrapper: "h-11 bg-parchment dark:bg-night-sea-2",
                  }}
                />
                <Button
                  type="submit"
                  color="secondary"
                  variant="flat"
                  className="w-full"
                  startContent={<Rocket size={16} />}
                >
                  参加する
                </Button>
              </form>
            </div>

            {/* Features card */}
            <div className="paper-card p-6">
              <h3 className="font-display text-xl text-deep-sea dark:text-parchment mb-1">
                主な機能
              </h3>
              <p className="text-sm text-deep-sea-ink/70 dark:text-parchment/70 mb-4 font-serif-jp">
                シンプルで使いやすい設計
              </p>
              <ul className="space-y-3">
                {[
                  { icon: <Check size={14} />, text: "アカウント不要", tone: "moss" },
                  { icon: <LinkIcon size={14} />, text: "URLで簡単共有", tone: "deep-sea" },
                  { icon: <MapPin size={14} />, text: "地図で場所を確認", tone: "rust" },
                  { icon: <Users size={14} />, text: "みんなで持ち寄り", tone: "gold" },
                ].map((item) => (
                  <li key={item.text} className="flex items-center gap-3 text-deep-sea-ink dark:text-parchment">
                    <span
                      className={`inline-flex w-7 h-7 items-center justify-center rounded-full ${
                        item.tone === "moss"
                          ? "bg-moss/15 text-moss dark:text-moss-soft"
                          : item.tone === "deep-sea"
                            ? "bg-deep-sea/15 text-deep-sea dark:text-parchment"
                            : item.tone === "rust"
                              ? "bg-rust/15 text-rust dark:text-rust-soft"
                              : "bg-gold/20 text-deep-sea-ink dark:text-gold-soft"
                      }`}
                      aria-hidden="true"
                    >
                      {item.icon}
                    </span>
                    <span className="font-serif-jp">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* How it works */}
          <section className="paper-card p-8">
            <div className="text-center mb-8">
              <h2 className="font-display text-2xl text-deep-sea dark:text-parchment mb-2">
                使い方はとても簡単
              </h2>
              <p className="text-sm text-deep-sea-ink/70 dark:text-parchment/70 font-serif-jp">
                3ステップで始められます
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 relative">
              {/* 点線の経路（md以上で表示） */}
              <div
                className="hidden md:block absolute top-7 left-[16.66%] right-[16.66%] h-px route-line pointer-events-none"
                aria-hidden="true"
              />

              {[
                {
                  step: 1,
                  title: "グループ作成",
                  body: "グループ名を入力して新しいリストを作成",
                },
                {
                  step: 2,
                  title: "場所を追加",
                  body: "行きたい場所のURLを貼り付けて保存",
                },
                {
                  step: 3,
                  title: "みんなで共有",
                  body: "グループURLを家族・友人に送信",
                },
              ].map((s) => (
                <div key={s.step} className="text-center relative">
                  <div className="relative inline-flex items-center justify-center w-14 h-14 mb-4 mx-auto bg-parchment dark:bg-night-sea-2 rounded-full border-2 border-deep-sea/30 dark:border-parchment/30">
                    <span className="font-display text-2xl text-deep-sea dark:text-parchment leading-none">
                      {s.step}
                    </span>
                  </div>
                  <h3 className="font-display text-lg text-deep-sea dark:text-parchment mb-1">
                    {s.title}
                  </h3>
                  <p className="text-sm text-deep-sea-ink/70 dark:text-parchment/70 font-serif-jp">
                    {s.body}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
