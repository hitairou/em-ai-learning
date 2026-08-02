# メール認証とMailgun設定手順

この手順はコード側の設定を行うためのものです。Mailgunのドメイン認証、DNS変更、メールボックス作成は運用者が実施してください。

1. `support@tairoh.com`のメールボックスまたはエイリアスを作成する。
2. Mailgunへ`auth.tairoh.com`だけをドメインとして追加する。
3. USまたはEUリージョンを選び、`MAILGUN_API_URL`を対応する公式URLへ設定する。
4. Mailgun管理画面に表示されたSPF・DKIM・検証用DNSレコードを`auth.tairoh.com`へ設定する。
5. `tairoh.com`ルートの既存MXレコードは変更しない。
6. Mailgun管理画面でSPF・DKIMの認証状態を確認する。
7. 認証メールの開封追跡・クリック追跡が無効であることを確認する。
8. GmailやOutlookなどへテストメールを送信し、SPF・DKIM結果を確認する。
9. GitHub Secretsへ秘密値、Variablesへ非秘密設定を登録する。
10. PRのCI成功後、デプロイ前チェックリストを確認する。

秘密値の例（実値は出力・コミットしない）：

```bash
openssl rand -base64 48
gh secret set MAILGUN_API_KEY --repo hitairou/em-ai-learning
gh secret set EMAIL_VERIFICATION_SECRET --repo hitairou/em-ai-learning
```

Variablesの例：

```bash
gh variable set MAILGUN_DOMAIN --body "auth.tairoh.com" --repo hitairou/em-ai-learning
gh variable set MAILGUN_API_URL --body "https://api.mailgun.net" --repo hitairou/em-ai-learning
gh variable set EMAIL_FROM_ADDRESS --body "no-reply@auth.tairoh.com" --repo hitairou/em-ai-learning
gh variable set EMAIL_FROM_NAME --body "EM PASS" --repo hitairou/em-ai-learning
gh variable set EMAIL_REPLY_TO --body "support@tairoh.com" --repo hitairou/em-ai-learning
gh variable set EMAIL_DELIVERY_MODE --body "mailgun" --repo hitairou/em-ai-learning
gh variable set EMAIL_CODE_TTL_MINUTES --body "10" --repo hitairou/em-ai-learning
gh variable set EMAIL_RESEND_COOLDOWN_SECONDS --body "60" --repo hitairou/em-ai-learning
gh variable set EMAIL_MAX_ATTEMPTS --body "5" --repo hitairou/em-ai-learning
gh variable set EMAIL_MAX_SENDS_PER_HOUR --body "5" --repo hitairou/em-ai-learning
gh variable set PENDING_REGISTRATION_TTL_HOURS --body "24" --repo hitairou/em-ai-learning
```

本番では`EMAIL_DELIVERY_MODE=mailgun`、CI・ローカルテストでは`EMAIL_DELIVERY_MODE=test`を使います。`support@tairoh.com`の作成済み状態やDNS認証済み状態は、このリポジトリからは確認できません。
