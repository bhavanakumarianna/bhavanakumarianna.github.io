(function () {
  const root = document.documentElement;
  root.classList.add('js');

  // Theme toggle
  const themeToggle = document.getElementById('themeToggle');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  const currentTheme = () => root.dataset.theme || (prefersDark.matches ? 'dark' : 'light');
  themeToggle.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  // Mobile menu
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const setMenu = (open) => {
    navLinks.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
  };
  navToggle.addEventListener('click', () => setMenu(!navLinks.classList.contains('open')));
  navLinks.addEventListener('click', (e) => { if (e.target.tagName === 'A') setMenu(false); });

  // Nav border on scroll
  const nav = document.getElementById('nav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Reveal on scroll + active nav link
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

    const links = [...navLinks.querySelectorAll('a')];
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach((s) => sectionObserver.observe(s));
  } else {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'));
  }

  // Count-up stats
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stats = document.querySelector('.stats');
  if (stats && !reduceMotion && 'IntersectionObserver' in window) {
    const countObserver = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      countObserver.disconnect();
      stats.querySelectorAll('[data-count]').forEach((el) => {
        const target = Number(el.dataset.count);
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min((now - start) / 1200, 1);
          el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.4 });
    countObserver.observe(stats);
  }

  // Copy email
  const toast = document.getElementById('toast');
  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1800);
  };
  document.getElementById('copyEmail').addEventListener('click', async (e) => {
    const email = e.currentTarget.dataset.email;
    try {
      await navigator.clipboard.writeText(email);
      showToast('Email copied ✓');
    } catch (err) {
      showToast(email);
    }
  });

  const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const EMAIL = 'bhavanakumarianna@gmail.com';
  const LINKEDIN = 'https://www.linkedin.com/in/bhavana-kumari-anna/';
  const GITHUB = 'https://github.com/bhavanakumarianna';
  const RESUME = 'Bhavana_Kumari_Anna_Resume.pdf';

  // Confetti
  const confetti = () => {
    if (reduceMotion) return;
    const colors = ['#818cf8', '#2dd4bf', '#f59e0b', '#f472b6', '#22c55e', '#60a5fa'];
    for (let i = 0; i < 80; i++) {
      const c = document.createElement('span');
      c.className = 'confetti';
      c.style.left = Math.random() * 100 + 'vw';
      c.style.background = colors[i % colors.length];
      c.style.animationDuration = 1.8 + Math.random() * 1.6 + 's';
      c.style.animationDelay = Math.random() * 0.4 + 's';
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 4000);
    }
  };

  // ---------- Interactive terminal ----------
  const termBody = document.getElementById('termBody');
  const termOut = document.getElementById('termOut');
  const termForm = document.getElementById('termForm');
  const termInput = document.getElementById('termInput');
  const link = (href, text) => `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;
  const goTo = (id) => document.getElementById(id).scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });

  const commands = {
    help: () => `available commands:
  <b>whoami</b>       who is this?
  <b>about</b>        short summary
  <b>skills</b>       tech stack
  <b>experience</b>   where I've worked
  <b>projects</b>     things I've built
  <b>certs</b>        certifications &amp; education
  <b>contact</b>      how to reach me
  <b>resume</b>       open my resume
  <b>fit</b>          check my fit for your role
  <b>clear</b>        clear the screen
  <span class="term-dim">psst… try</span> <b>sudo hire bhavana</b>`,
    whoami: () => 'Bhavana Kumari Anna, Software Engineer @ Cisco · Atlanta, GA',
    about: () => `2+ years building cloud-native backends, distributed systems and AI platforms. Java &amp; Python on Azure + Kubernetes. Built an LLM + RAG agent at Cisco that cut MTTR by <span class="term-ok">40%</span>.`,
    skills: () => `lang     Java, Python, C#, TypeScript, SQL
backend  Spring Boot, Node.js, REST, GraphQL
cloud    Azure, AKS, AWS, Docker, Terraform
ai       LLMs, RAG, AI agents, FAISS
data     PostgreSQL, MongoDB, Cosmos DB
ops      SRE, Azure Monitor, CI/CD, on-call`,
    experience: () => `2025–now   Software Engineer · Cisco
2023–2025  Teaching Assistant · KSU
2022–2023  Software Developer · Infosys`,
    projects: () => `▸ AI Root-Cause Analysis Agent (↓40% MTTR)
▸ Semantic Log Anomaly Detection
▸ Healthcare Recommender (KSU hackathon)
▸ Neural Conversational Agent (TensorFlow)`,
    certs: () => `✓ AWS Certified Developer – Associate
✓ Microsoft Certified: Azure Developer Associate
🎓 M.S. Computer Science, Kennesaw State (GPA 3.66)`,
    contact: () => `email     <a href="mailto:${EMAIL}">${EMAIL}</a>
linkedin  ${link(LINKEDIN, 'in/bhavana-kumari-anna')}
github    ${link(GITHUB, 'github.com/bhavanakumarianna')}`,
    resume: () => { window.open(RESUME, '_blank', 'noopener'); return `opening ${link(RESUME, 'resume.pdf')}…`; },
    github: () => { window.open(GITHUB, '_blank', 'noopener'); return 'opening github…'; },
    linkedin: () => { window.open(LINKEDIN, '_blank', 'noopener'); return 'opening linkedin…'; },
    fit: () => { setTimeout(() => goTo('fit'), 300); return 'scrolling to the fit check…'; },
    ls: () => 'about.txt  skills.json  experience.log  projects/  resume.pdf',
    hire: () => '<span class="term-err">permission denied.</span> try: <b>sudo hire bhavana</b>',
    sudo: (args) => {
      if (/^hire(\s|-)?bhavana$/i.test(args.trim())) {
        confetti();
        return `[sudo] password for recruiter: ********
<span class="term-ok">✓ access granted. excellent decision.</span>
next step → <a href="mailto:${EMAIL}?subject=Let's%20talk%20about%20a%20role">${EMAIL}</a>`;
      }
      return '<span class="term-err">recruiter is not in the sudoers file.</span> nice try 😄';
    },
  };
  commands.cat = (args) => {
    const file = args.trim().replace(/\.(txt|json|log|yaml)$/, '');
    if (file === 'resume.pdf') return commands.resume();
    return commands[file] && file !== 'cat' ? commands[file]() : `cat: ${esc(args)}: no such file`;
  };

  const history = [];
  let histIdx = 0;
  termForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const raw = termInput.value.trim();
    termInput.value = '';
    if (!raw) return;
    history.push(raw);
    histIdx = history.length;
    const [cmd, ...rest] = raw.split(/\s+/);
    const name = cmd.toLowerCase();
    if (name === 'clear') { termOut.innerHTML = ''; return; }
    const fn = commands[name];
    const output = fn ? fn(rest.join(' ')) : `<span class="term-err">command not found: ${esc(cmd)}</span>. type <b>help</b>`;
    const entry = document.createElement('div');
    entry.className = 'term-entry';
    entry.innerHTML = `<p><span class="prompt">$</span>${esc(raw)}</p><div class="out">${output}</div>`;
    termOut.appendChild(entry);
    termBody.scrollTop = termBody.scrollHeight;
  });
  termInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' && histIdx > 0) { termInput.value = history[--histIdx]; e.preventDefault(); }
    if (e.key === 'ArrowDown') { histIdx = Math.min(histIdx + 1, history.length); termInput.value = history[histIdx] || ''; }
  });
  termBody.addEventListener('click', (e) => { if (e.target.tagName !== 'A' && !window.getSelection().toString()) termInput.focus(); });

  // ---------- Job fit check ----------
  const EVIDENCE = {
    backend: 'Cisco: built scalable backend microservices and REST APIs for enterprise SaaS serving millions of users',
    ai: 'Cisco: architected an LLM + RAG agent framework for automated root-cause analysis (↓40% MTTR)',
    vector: 'Cisco: semantic log anomaly detection with Azure OpenAI embeddings and FAISS vector search',
    k8s: 'Cisco: shipped containerized workloads on AKS + Docker with high availability and auto-scaling',
    cicd: 'Cisco: built CI/CD pipelines with GitHub Actions and Azure DevOps',
    obs: 'Cisco: telemetry pipelines and observability dashboards that improved reliability by 30%',
    sre: 'Cisco: on-call DRI applying SRE practices to debug and restore production systems',
    perf: 'Cisco: +20% throughput through load balancing, A/B experiments and design reviews',
    api: 'Infosys: secure RESTful APIs, contracts and schemas that cut onboarding time by 35%',
    iac: 'Infosys: automated cloud provisioning with Terraform and ARM templates',
    migration: 'Infosys: legacy → cloud-native migration on Azure with 25% performance gains',
    data: 'Infosys: ETL and data processing optimizations on Azure',
    aws: 'AWS Certified Developer – Associate',
    azure: 'Microsoft Certified: Azure Developer Associate',
    teach: 'Kennesaw State: taught DSA, Operating Systems & Distributed Systems; mentored students on backend design',
    ml: 'Built a TensorFlow seq2seq LSTM chatbot; M.S. coursework in ML and Information Retrieval',
    hackathon: 'KSU Hackathon: full-stack Flask app using the Gemini API',
  };
  // [label, pattern, evidence key | null]
  const HAVE = [
    ['Java', /\bjava\b(?!\s*script)/i, 'backend'],
    ['Python', /\bpython\b/i, 'backend'],
    ['C#', /c#|c sharp/i, null],
    ['.NET', /\.net\b|dotnet/i, null],
    ['C++', /c\+\+/i, null],
    ['JavaScript', /javascript/i, null],
    ['TypeScript', /typescript/i, null],
    ['Rust', /\brust\b/i, null],
    ['SQL', /\bsql\b/i, 'data'],
    ['Bash / Shell', /\bbash\b|shell script/i, null],
    ['PowerShell', /powershell/i, null],
    ['Linux', /\blinux\b|unix/i, null],
    ['Spring Boot', /spring/i, 'backend'],
    ['ASP.NET Core', /asp\.net/i, null],
    ['Node.js', /node\.?js/i, null],
    ['Django', /django/i, null],
    ['Flask', /flask/i, 'hackathon'],
    ['GraphQL', /graphql/i, null],
    ['REST APIs', /restful|rest api|rest-api|\bapis?\b/i, 'api'],
    ['Microservices', /micro-?services?/i, 'backend'],
    ['Distributed systems', /distributed (systems?|computing)/i, 'backend'],
    ['System design', /system design|software architecture|design patterns|architect/i, 'backend'],
    ['Serverless', /serverless|azure functions/i, null],
    ['Azure', /\bazure\b/i, 'azure'],
    ['AWS', /\baws\b|amazon web services/i, 'aws'],
    ['GCP', /\bgcp\b|google cloud/i, null],
    ['Cloud', /\bcloud\b/i, 'migration'],
    ['Docker', /docker|container/i, 'k8s'],
    ['Kubernetes', /kubernetes|\bk8s\b|\baks\b|\beks\b|\bgke\b/i, 'k8s'],
    ['Terraform', /terraform/i, 'iac'],
    ['Infrastructure as Code', /infrastructure[- ]as[- ]code|\biac\b|\barm templates?\b/i, 'iac'],
    ['CI/CD', /ci\s*\/\s*cd|continuous (integration|delivery|deployment)/i, 'cicd'],
    ['GitHub Actions', /github actions/i, 'cicd'],
    ['Azure DevOps', /azure devops/i, 'cicd'],
    ['DevOps', /\bdevops\b/i, 'cicd'],
    ['Git', /\bgit\b/i, null],
    ['LLMs / GenAI', /\bllms?\b|large language models?|generative ai|gen\s?ai/i, 'ai'],
    ['RAG', /\brag\b|retrieval[- ]augmented/i, 'ai'],
    ['AI agents', /\bai agents?\b|agentic|\bagents\b/i, 'ai'],
    ['Embeddings / vector search', /embeddings?|vector (search|database|db|store)|faiss/i, 'vector'],
    ['OpenAI', /openai/i, 'vector'],
    ['Machine learning', /machine learning|\bml\b/i, 'ml'],
    ['Deep learning', /deep learning|neural network/i, 'ml'],
    ['TensorFlow', /tensorflow|keras/i, 'ml'],
    ['NLP', /\bnlp\b|natural language/i, 'ml'],
    ['Information retrieval', /information retrieval|semantic search/i, 'vector'],
    ['PostgreSQL', /postgres/i, null],
    ['MySQL', /mysql/i, null],
    ['MongoDB', /mongo/i, null],
    ['NoSQL', /nosql/i, null],
    ['Cosmos DB', /cosmos/i, null],
    ['ETL / data pipelines', /\betl\b|data pipelines?/i, 'data'],
    ['Observability', /observability|monitoring|telemetry|logging/i, 'obs'],
    ['SRE / reliability', /\bsre\b|site reliability|reliability/i, 'sre'],
    ['Incident management / on-call', /on-?call|incident/i, 'sre'],
    ['Scalability / HA', /scalab|high[- ]availability|fault[- ]toleran/i, 'perf'],
    ['Load balancing', /load[- ]balanc/i, 'perf'],
    ['Performance optimization', /performance (tuning|optimization)|latency|throughput/i, 'perf'],
    ['Caching', /cach(e|ing)/i, null],
    ['OAuth2 / JWT', /oauth|jwt/i, 'api'],
    ['A/B testing', /a\/b test/i, 'perf'],
    ['Agile / Scrum', /agile|scrum/i, null],
    ['Data structures & algorithms', /data structures|algorithms/i, 'teach'],
    ['OOP', /object[- ]oriented|\boop\b/i, null],
    ['Mentoring', /mentor/i, 'teach'],
    ['Power BI', /power ?bi/i, null],
    ['Jira', /\bjira\b/i, null],
  ];
  const MISSING = [
    ['Go', /\bgolang\b|\bgo\s*(?:,|\/|\))|(?:,|\/|\()\s*go\b/i],
    ['Kafka', /kafka/i], ['React', /\breact\b/i], ['Angular', /angular/i], ['Vue', /\bvue/i],
    ['Spark', /\bspark\b/i], ['Scala', /\bscala\b/i], ['Kotlin', /kotlin/i], ['Ruby', /\bruby\b|rails/i],
    ['PHP', /\bphp\b/i], ['Swift', /\bswift\b/i], ['Redis', /redis/i], ['Elasticsearch', /elastic/i],
    ['Snowflake', /snowflake/i], ['Airflow', /airflow/i], ['PyTorch', /pytorch/i], ['Hadoop', /hadoop/i],
    ['Cassandra', /cassandra/i], ['DynamoDB', /dynamo/i], ['Jenkins', /jenkins/i], ['Ansible', /ansible/i],
    ['Prometheus', /prometheus/i], ['Grafana', /grafana/i], ['Datadog', /datadog/i], ['Splunk', /splunk/i],
    ['gRPC', /grpc/i], ['RabbitMQ', /rabbitmq/i], ['Databricks', /databricks/i], ['Kinesis', /kinesis/i],
  ];
  const SAMPLE_JD = `Software Engineer II, AI Platform

We're looking for a backend engineer to build the services behind our generative AI platform.

What you'll do:
- Design and build scalable, distributed microservices and REST APIs in Java or Python
- Build retrieval-augmented generation (RAG) pipelines and AI agents on top of LLMs
- Deploy services on Kubernetes in Azure or AWS using Docker and CI/CD pipelines
- Own reliability: observability, monitoring, on-call and incident management
- Work with PostgreSQL, vector databases, and Kafka-based event streaming

What you bring:
- 2+ years of professional software engineering experience
- Strong fundamentals in data structures, algorithms and system design
- Experience with infrastructure as code (Terraform) is a plus`;

  const jd = document.getElementById('jd');
  const fitResult = document.getElementById('fitResult');
  const chips = (items, cls = '') => `<ul class="chips">${items.map((s) => `<li class="${cls}">${esc(s)}</li>`).join('')}</ul>`;

  const runFit = () => {
    const text = jd.value;
    if (text.trim().length < 30) {
      showToast('Paste a job description first');
      jd.focus();
      return;
    }
    const matched = HAVE.filter(([, re]) => re.test(text));
    const missing = MISSING.filter(([, re]) => re.test(text)).map(([label]) => label);
    const total = matched.length + missing.length;
    if (!total) {
      fitResult.innerHTML = `<div class="fit-empty"><p>I couldn't find specific technologies in that text.<br>Try pasting the full requirements section.</p></div>`;
      return;
    }
    const pct = Math.round((matched.length / total) * 100);
    const verdict = pct >= 80 ? 'Strong match' : pct >= 60 ? 'Good match' : 'Partial match';
    const evidence = [...new Set(matched.map(([, , key]) => key).filter(Boolean))].slice(0, 5).map((k) => EVIDENCE[k]);
    const subject = encodeURIComponent('Opportunity: role matching your profile');

    fitResult.innerHTML = `
      <div class="score">
        <div class="ring" id="ring"><span>${pct}%</span></div>
        <div>
          <h3>${verdict}</h3>
          <p>${matched.length} of ${total} technologies in this role appear on my resume.</p>
        </div>
      </div>
      <div class="fit-block"><h4>Matching skills</h4>${chips(matched.map(([label]) => label), 'hl')}</div>
      ${evidence.length ? `<div class="fit-block"><h4>Where I've used them</h4><ul class="evidence">${evidence.map((e) => `<li>${esc(e)}</li>`).join('')}</ul></div>` : ''}
      ${missing.length ? `<div class="fit-block"><h4>Not on my resume yet</h4>${chips(missing, 'miss')}<p class="fit-note">I've picked up new stacks quickly before, going from Java and Azure to LLMs, RAG and vector search in production.</p></div>` : ''}
      <div class="fit-actions">
        <a class="btn btn-primary" href="mailto:${EMAIL}?subject=${subject}">Email me about this role</a>
        <a class="btn btn-ghost" href="${RESUME}" download>Download resume</a>
      </div>`;
    const ring = document.getElementById('ring');
    requestAnimationFrame(() => requestAnimationFrame(() => ring.style.setProperty('--p', pct)));
    if (pct >= 80) confetti();
    if (window.innerWidth < 960) fitResult.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  };
  document.getElementById('fitRun').addEventListener('click', runFit);
  document.getElementById('fitSample').addEventListener('click', () => { jd.value = SAMPLE_JD; runFit(); });
  jd.addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) runFit(); });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
