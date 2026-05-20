import type { Route } from "./+types/home";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button, Input } from "@heroui/react";
import { MapPin, Users, Link as LinkIcon, Check, Sparkles, ArrowRight } from "lucide-react";
import { AppHeader } from "../components/app-header";

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
      <div className="container mx-auto px-4 py-16 sm:py-20">
        <div className="max-w-3xl mx-auto">
          {/* Hero */}
          <section className="text-center mb-14">
            <p className="text-eyebrow mb-4">アカウント不要・URL共有</p>
            <h1 className="font-display text-4xl sm:text-5xl text-deep-sea dark:text-parchment leading-tight mb-5">
              行きたい場所を、
              <br className="hidden sm:block" />
              みんなで共有しよう。
            </h1>
            <p className="text-base sm:text-lg text-deep-sea-ink/70 dark:text-parchment/70 max-w-xl mx-auto leading-relaxed mb-8">
              URL ひとつでグループを作成。家族・恋人・友人とお気に入りの場所を
              持ち寄って、ゆっくり計画できます。
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Button
                as={Link}
                to="/create"
                color="primary"
                size="lg"
                className="px-8 font-medium"
                endContent={<ArrowRight size={18} />}
              >
                新しいグループを作成
              </Button>
              <a
                href="#join"
                className="text-sm text-deep-sea-ink/70 dark:text-parchment/70 hover:text-deep-sea dark:hover:text-parchment underline decoration-deep-sea-ink/30 dark:decoration-parchment/30 underline-offset-4"
              >
                既存のグループに参加する
              </a>
            </div>
          </section>

          {/* Features grid */}
          <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-14">
            {[
              { icon: <Check size={16} />, title: "アカウント不要", body: "メール登録なしで始められます" },
              { icon: <LinkIcon size={16} />, title: "URLで共有", body: "URLを送るだけでメンバー追加" },
              { icon: <MapPin size={16} />, title: "地図で確認", body: "場所を地図ピンで一目で把握" },
              { icon: <Users size={16} />, title: "みんなで持ち寄り", body: "誰でも追加・更新が可能" },
            ].map((item) => (
              <div key={item.title} className="surface p-5">
                <span className="inline-flex w-9 h-9 items-center justify-center rounded-lg bg-default text-deep-sea-ink dark:text-parchment mb-3">
                  {item.icon}
                </span>
                <h3 className="text-sm font-semibold text-deep-sea dark:text-parchment mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-deep-sea-ink/65 dark:text-parchment/65 leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </section>

          {/* Join existing group */}
          <section id="join" className="surface p-6 sm:p-7 mb-10">
            <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
              <div>
                <h2 className="font-display text-lg text-deep-sea dark:text-parchment mb-1">
                  既存グループに参加
                </h2>
                <p className="text-sm text-deep-sea-ink/65 dark:text-parchment/65">
                  共有された 8 文字のグループ ID を入力してください
                </p>
              </div>
            </div>
            <form onSubmit={handleJoinGroup} className="flex gap-2 flex-wrap">
              <Input
                type="text"
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                placeholder="例: xy7k9m2p"
                maxLength={8}
                variant="bordered"
                classNames={{
                  input: "font-mono tracking-wider",
                  inputWrapper: "bg-content2",
                  base: "flex-1 min-w-[200px]",
                }}
              />
              <Button
                type="submit"
                color="primary"
                variant="flat"
                isDisabled={groupId.trim().length === 0}
              >
                参加する
              </Button>
            </form>
          </section>

          {/* How it works */}
          <section className="grid sm:grid-cols-3 gap-3">
            {[
              { step: 1, title: "グループを作る", body: "名前を入力するだけ" },
              { step: 2, title: "場所を追加", body: "URL を貼って保存" },
              { step: 3, title: "メンバーに共有", body: "URL を送るだけ" },
            ].map((s) => (
              <div key={s.step} className="flex gap-3 items-start p-1">
                <span className="shrink-0 inline-flex w-7 h-7 items-center justify-center rounded-full border border-line text-deep-sea dark:text-parchment text-xs font-semibold">
                  {s.step}
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-deep-sea dark:text-parchment mb-0.5">
                    {s.title}
                  </h3>
                  <p className="text-xs text-deep-sea-ink/65 dark:text-parchment/65">
                    {s.body}
                  </p>
                </div>
              </div>
            ))}
          </section>
        </div>
      </div>
    </>
  );
}
