const cards = document.querySelectorAll('.project-card');
const lightbox = document.querySelector('#lightbox');
const lightboxImage = document.querySelector('#lightbox-image');
const lightboxTitle = document.querySelector('#lightbox-title');
const lightboxMeta = document.querySelector('#lightbox-meta');
const lightboxPrev = document.querySelector('.lightbox-prev');
const lightboxNext = document.querySelector('.lightbox-next');
const folderView = document.querySelector('#folder-view');
const folderGrid = document.querySelector('#folder-grid');
const folderViewTitle = document.querySelector('#folder-view-title');
const folderViewBack = document.querySelector('#folder-view-back');
let galleryImages = [];
let galleryIndex = 0;
let galleryTitle = '';
let folderStack = [];

cards.forEach((card) => {
  const template = card.querySelector('.gallery-images');
  if (!template) return;
  const images = [...template.content.querySelectorAll('img')];
  const cardImage = card.querySelector('.card-image');
  const mainImg = cardImage.querySelector('img');
  [images[2], images[1]].forEach((image, i) => {
    if (!image) return;
    const stack = document.createElement('img');
    stack.className = `stack-img stack-img--${2 - i}`;
    stack.src = image.src;
    stack.alt = '';
    stack.loading = 'lazy';
    stack.decoding = 'async';
    cardImage.insertBefore(stack, mainImg);
  });
  const badge = document.createElement('span');
  badge.className = 'card-title-badge';
  badge.textContent = card.dataset.title;
  cardImage.appendChild(badge);
});

const setLightboxImage = (image) => {
  const fullSrc = (image.dataset && image.dataset.full) || image.src;
  lightboxImage.onerror = () => {
    lightboxImage.onerror = null;
    lightboxImage.src = image.src;
  };
  lightboxImage.src = fullSrc;
  lightboxImage.alt = image.alt;
  lightboxMeta.textContent = image.alt;
};

const showGalleryImage = (index) => {
  galleryIndex = (index + galleryImages.length) % galleryImages.length;
  setLightboxImage(galleryImages[galleryIndex]);
};

const animateGalleryImage = (index) => {
  galleryIndex = (index + galleryImages.length) % galleryImages.length;
  const image = galleryImages[galleryIndex];
  lightboxImage.classList.add('img-exit');
  lightboxImage.addEventListener('transitionend', () => {
    setLightboxImage(image);
    lightboxImage.classList.add('img-enter-instant');
    lightboxImage.classList.remove('img-exit');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        lightboxImage.classList.remove('img-enter-instant');
      });
    });
  }, { once: true });
};

const openLightboxAt = (index) => {
  lightboxTitle.textContent = '';
  lightboxPrev.hidden = galleryImages.length < 2;
  lightboxNext.hidden = galleryImages.length < 2;
  showGalleryImage(index);
  lightbox.showModal();
};
const stars = document.querySelectorAll('.hero-stars span, .hero-image img');
const heroImageIndex = [...stars].findIndex((el) => el.matches('.hero-image img'));
const starState = [...stars].map(() => ({ currentX: 0, currentY: 0, targetX: 0, targetY: 0, velocityX: 0, velocityY: 0 }));
let starFrame;

const animateStars = () => {
  let moving = false;
  starState.forEach((state, index) => {
    const isHeroImage = index === heroImageIndex;
    const friction = isHeroImage ? 0.99 : 0.985;
    const lerp = isHeroImage ? 0.12 : 0.08;
    state.targetX += state.velocityX;
    state.targetY += state.velocityY;
    state.velocityX *= friction;
    state.velocityY *= friction;
    state.currentX += (state.targetX - state.currentX) * lerp;
    state.currentY += (state.targetY - state.currentY) * lerp;
    stars[index].style.setProperty('--mouse-x', `${state.currentX}px`);
    stars[index].style.setProperty('--mouse-y', `${state.currentY}px`);
    if (isHeroImage) {
      const rotate = Math.max(-18, Math.min(18, state.velocityX * 4));
      stars[index].style.setProperty('--mouse-rotate', `${rotate}deg`);
    }
    if (Math.abs(state.targetX - state.currentX) > 0.1 || Math.abs(state.targetY - state.currentY) > 0.1 || Math.abs(state.velocityX) > 0.01 || Math.abs(state.velocityY) > 0.01) moving = true;
  });
  if (moving) starFrame = requestAnimationFrame(animateStars);
};

const startStarAnimation = () => {
  if (!starFrame) starFrame = requestAnimationFrame(() => {
    starFrame = undefined;
    animateStars();
  });
};

document.querySelector('.hero').addEventListener('pointermove', (event) => {
  stars.forEach((star, index) => {
    const isHeroImage = index === heroImageIndex;
    const bounds = star.getBoundingClientRect();
    const distanceX = event.clientX - (bounds.left + bounds.width / 2);
    const distanceY = event.clientY - (bounds.top + bounds.height / 2);
    const distance = Math.hypot(distanceX, distanceY);
    const radius = isHeroImage ? Math.max(bounds.width, bounds.height) / 2 + 120 : 190;
    const state = starState[index];

    if (distance < radius) {
      const strength = (radius - distance) / radius;
      if (distance > 0) {
        const pushStep = strength * (isHeroImage ? 4.5 : 2);
        const directionX = -distanceX / distance;
        const directionY = -distanceY / distance;
        state.targetX += directionX * pushStep;
        state.targetY += directionY * pushStep;
        state.velocityX += directionX * strength * (isHeroImage ? 0.14 : 0.08);
        state.velocityY += directionY * strength * (isHeroImage ? 0.14 : 0.08);

        const targetDistance = Math.hypot(state.targetX, state.targetY);
        const maximumDistance = isHeroImage ? 260 : 420;
        if (targetDistance > maximumDistance) {
          state.targetX = state.targetX / targetDistance * maximumDistance;
          state.targetY = state.targetY / targetDistance * maximumDistance;
        }
      }
    }
    startStarAnimation();
  });
});

const buildSubfolderTile = (sub, index, onOpen) => {
  const tile = document.createElement('button');
  tile.type = 'button';
  tile.className = 'folder-grid-item folder-grid-item--sub';
  tile.setAttribute('aria-label', `Otevřít podsložku ${sub.title}`);
  tile.style.setProperty('--i', index);

  [sub.images[2], sub.images[1]].forEach((image, i) => {
    if (!image) return;
    const stack = document.createElement('img');
    stack.className = `stack-img stack-img--${2 - i}`;
    stack.src = image.src;
    stack.alt = '';
    stack.loading = 'lazy';
    stack.decoding = 'async';
    tile.appendChild(stack);
  });

  const cover = document.createElement('img');
  cover.className = 'sub-cover';
  cover.src = sub.images[0].src;
  cover.alt = sub.title;
  cover.loading = 'lazy';
  cover.decoding = 'async';
  tile.appendChild(cover);

  const badge = document.createElement('span');
  badge.className = 'card-title-badge';
  badge.textContent = sub.title;
  tile.appendChild(badge);

  tile.addEventListener('click', onOpen);
  return tile;
};

const renderFolderLevel = (title, images, subfolders) => {
  galleryTitle = title;
  galleryImages = images;
  folderViewTitle.textContent = title;
  folderViewBack.hidden = folderStack.length === 0;
  folderGrid.innerHTML = '';
  folderGrid.classList.toggle('folder-grid--grid3', title === 'Zlatý řez');

  let tileIndex = 0;

  images.forEach((image, index) => {
    const thumb = document.createElement('button');
    thumb.type = 'button';
    thumb.className = 'folder-grid-item';
    thumb.setAttribute('aria-label', image.alt);
    thumb.style.setProperty('--i', tileIndex++);
    thumb.style.setProperty('--rot', `${(index % 2 === 0 ? -1 : 1) * (4 + (index % 3) * 3)}deg`);
    const img = document.createElement('img');
    img.src = image.src;
    img.alt = image.alt;
    img.loading = 'lazy';
    img.decoding = 'async';
    thumb.appendChild(img);
    thumb.addEventListener('click', () => openLightboxAt(index));
    folderGrid.appendChild(thumb);
  });

  (subfolders || []).forEach((sub) => {
    const tile = buildSubfolderTile(sub, tileIndex++, () => {
      folderStack.push({ title, images, subfolders });
      renderFolderLevel(sub.title, sub.images, []);
    });
    folderGrid.appendChild(tile);
  });
};

folderViewBack.addEventListener('click', () => {
  const previous = folderStack.pop();
  if (previous) renderFolderLevel(previous.title, previous.images, previous.subfolders);
});

document.querySelectorAll('.painting-group').forEach((group) => {
  const groupTitle = group.dataset.title || 'moje malby';
  const template = group.querySelector('.gallery-images');
  const groupImages = template ? [...template.content.querySelectorAll('img')] : [];

  const grid = document.createElement('div');
  grid.className = 'folder-grid painting-grid';

  let tileIndex = 0;
  groupImages.forEach((image, index) => {
    const thumb = document.createElement('button');
    thumb.type = 'button';
    thumb.className = 'folder-grid-item';
    thumb.setAttribute('aria-label', image.alt);
    thumb.style.setProperty('--i', tileIndex++);
    thumb.style.setProperty('--rot', `${(index % 2 === 0 ? -1 : 1) * (4 + (index % 3) * 3)}deg`);
    const img = document.createElement('img');
    img.src = image.src;
    img.alt = image.alt;
    img.loading = 'lazy';
    img.decoding = 'async';
    thumb.appendChild(img);
    thumb.addEventListener('click', () => {
      galleryTitle = groupTitle;
      galleryImages = groupImages;
      openLightboxAt(index);
    });
    grid.appendChild(thumb);
  });

  group.appendChild(grid);
});

cards.forEach((card) => {
  card.querySelector('.card-image').addEventListener('click', () => {
    const template = card.querySelector('.gallery-images');

    if (template) {
      folderStack = [];
      const images = [...template.content.querySelectorAll('img')];
      const subfolderTemplates = [...card.querySelectorAll('.gallery-subfolder')];
      const subfolders = subfolderTemplates.map((sub) => ({
        title: sub.dataset.title,
        images: [...sub.content.querySelectorAll('img')],
      }));
      renderFolderLevel(card.dataset.title, images, subfolders);
      folderView.showModal();
    } else {
      const image = card.querySelector('img');
      galleryTitle = card.dataset.title;
      galleryImages = [{ src: image.src, alt: card.dataset.meta }];
      openLightboxAt(0);
    }
  });
});

lightboxPrev.addEventListener('click', () => animateGalleryImage(galleryIndex - 1));
lightboxNext.addEventListener('click', () => animateGalleryImage(galleryIndex + 1));
lightbox.addEventListener('keydown', (event) => {
  if (galleryImages.length < 2) return;
  if (event.key === 'ArrowLeft') animateGalleryImage(galleryIndex - 1);
  if (event.key === 'ArrowRight') animateGalleryImage(galleryIndex + 1);
});

const closeLightbox = () => {
  if (lightbox.classList.contains('closing')) return;
  lightbox.classList.add('closing');
  lightbox.addEventListener('transitionend', () => {
    lightbox.classList.remove('closing');
    lightbox.close();
  }, { once: true });
};

document.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox) closeLightbox();
});
lightbox.addEventListener('cancel', (event) => {
  event.preventDefault();
  closeLightbox();
});

const closeFolderView = () => {
  if (folderView.classList.contains('closing')) return;
  folderView.classList.add('closing');
  folderView.addEventListener('transitionend', () => {
    folderView.classList.remove('closing');
    folderView.close();
    folderStack = [];
  }, { once: true });
};

const waveThumb = document.querySelector('#wave-thumb');
const updateWaveThumb = () => {
  const scrollHeight = document.documentElement.scrollHeight;
  const viewportHeight = window.innerHeight;
  const thumbHeight = Math.max(50, (viewportHeight / scrollHeight) * viewportHeight);
  const maxScroll = scrollHeight - viewportHeight;
  const scrollRatio = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  waveThumb.style.height = `${thumbHeight}px`;
  waveThumb.style.top = `${scrollRatio * (viewportHeight - thumbHeight)}px`;
};
if (waveThumb) {
  updateWaveThumb();
  window.addEventListener('scroll', updateWaveThumb, { passive: true });
  window.addEventListener('resize', updateWaveThumb);

  let dragStartY = 0;
  let dragStartScroll = 0;

  const onDragMove = (event) => {
    const viewportHeight = window.innerHeight;
    const scrollHeight = document.documentElement.scrollHeight;
    const thumbHeight = waveThumb.offsetHeight;
    const maxScroll = scrollHeight - viewportHeight;
    const maxThumbTop = viewportHeight - thumbHeight;
    const deltaY = event.clientY - dragStartY;
    const scrollDelta = maxThumbTop > 0 ? (deltaY / maxThumbTop) * maxScroll : 0;
    window.scrollTo({ top: Math.min(maxScroll, Math.max(0, dragStartScroll + scrollDelta)), behavior: 'instant' });
  };

  const onDragEnd = () => {
    waveThumb.classList.remove('dragging');
    document.body.style.userSelect = '';
    document.documentElement.style.scrollBehavior = '';
    document.removeEventListener('pointermove', onDragMove);
    document.removeEventListener('pointerup', onDragEnd);
  };

  waveThumb.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    dragStartY = event.clientY;
    dragStartScroll = window.scrollY;
    waveThumb.classList.add('dragging');
    document.body.style.userSelect = 'none';
    document.documentElement.style.scrollBehavior = 'auto';
    document.addEventListener('pointermove', onDragMove);
    document.addEventListener('pointerup', onDragEnd);
  });
}

document.querySelector('.folder-view-close').addEventListener('click', closeFolderView);
folderView.addEventListener('click', (event) => {
  if (!event.target.closest('.folder-grid-item') && !event.target.closest('.folder-view-close') && !event.target.closest('.folder-view-back')) closeFolderView();
});
folderView.addEventListener('cancel', (event) => {
  event.preventDefault();
  closeFolderView();
});

const aboutPopup = document.querySelector('#about-popup');
const aboutLink = document.querySelector('#about-link');
const aboutFirework = document.querySelector('#about-firework');
const colors = ['#ff84ba', '#6367ff', '#a3a6ff', '#ffcb56', '#dcddff'];

const fireworkAudio = new Audio('stránka/universfield-bubble-pop-06-351337.mp3');
const playFireworkSound = () => {
  try {
    fireworkAudio.currentTime = 0;
    fireworkAudio.play();
  } catch (error) {
    // audio unsupported or blocked - ignore
  }
};

const launchFirework = () => {
  if (!aboutFirework) return;
  aboutFirework.innerHTML = '';
  const count = 90;
  for (let i = 0; i < count; i++) {
    const star = document.createElement('span');
    star.className = 'firework-star';
    star.textContent = Math.random() > 0.5 ? '✦' : '✧';
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
    const distance = 260 + Math.random() * 620;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    const fx = dx + (Math.random() - 0.5) * 140;
    const fy = dy + 340 + Math.random() * 380;
    star.style.setProperty('--dx', `${dx}px`);
    star.style.setProperty('--dy', `${dy}px`);
    star.style.setProperty('--fx', `${fx}px`);
    star.style.setProperty('--fy', `${fy}px`);
    star.style.setProperty('--rot', `${(Math.random() - 0.5) * 180}deg`);
    star.style.setProperty('--size', `${0.8 + Math.random() * 1.6}rem`);
    star.style.setProperty('--dur', `${2.2 + Math.random() * 1}s`);
    star.style.setProperty('--delay', `${Math.random() * 0.15}s`);
    star.style.color = colors[Math.floor(Math.random() * colors.length)];
    aboutFirework.appendChild(star);
  }
};

if (aboutPopup && aboutLink) {
  const closeAboutPopup = () => {
    if (aboutPopup.classList.contains('closing')) return;
    aboutPopup.classList.add('closing');
    aboutPopup.addEventListener('transitionend', () => {
      aboutPopup.classList.remove('closing');
      aboutPopup.close();
    }, { once: true });
  };

  aboutLink.addEventListener('click', () => {
    aboutPopup.showModal();
    launchFirework();
    playFireworkSound();
  });
  aboutPopup.querySelector('.about-popup-close').addEventListener('click', closeAboutPopup);
  aboutPopup.addEventListener('click', (event) => {
    if (event.target === aboutPopup) closeAboutPopup();
  });
  aboutPopup.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeAboutPopup();
  });
}