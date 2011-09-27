package fr.ifn.eforest.common.util;

import java.util.HashMap;
import java.util.Map;
import java.util.Date;

/**
 * Simple Cache Object. No synchronization is done, this cache should be used for read-only tables. Cache can be simple, size-limited and/or time-limited.
 */
public class LocalCache {

	// Le container de données
	private Map cachemap;

	// La taille max
	private int maxSize = -1;

	// La limitation du temps
	private boolean timeLimited = false;
	private Date lastUpdateDate = null;
	private long maxLifeTime;

	/**
	 * LocalCache constructor. This cache is a permanent cache.
	 */
	private LocalCache() {
		super();
		cachemap = new HashMap();
	}

	/**
	 * LocalCache constructor. This cache is a size-limited cache.
	 */
	private LocalCache(int aMaxSize) {
		super();
		cachemap = new HashMap(aMaxSize);
		maxSize = aMaxSize;
	}

	/**
	 * LocalCache Factory. Return a local cache with a size limit.
	 */
	public static LocalCache getSizeLimitedLocalCache(int aMaxSize) {
		return new LocalCache(aMaxSize);
	}

	/**
	 * LocalCache Factory. Return a local cache with a time limit.
	 */
	public static LocalCache getTimeLimitedLocalCache(int aMaxLifeTimeInMs) {
		LocalCache localCache = new LocalCache();
		localCache.setTimeLimited(true);
		localCache.setMaxLifeTime(aMaxLifeTimeInMs);
		return localCache;
	}

	/**
	 * LocalCache Factory. Return a local cache with a size and a time limit.
	 */
	public static LocalCache getSizeAndTimeLimitedLocalCache(int aMaxSize, int aMaxLifeTimeInMs) {
		LocalCache localCache = new LocalCache(aMaxSize);
		localCache.setTimeLimited(true);
		localCache.setMaxLifeTime(aMaxLifeTimeInMs);
		return localCache;
	}

	/**
	 * Get an Object from cache. If returned result is null, a get from the source should be done.
	 */
	public Object get(Object key) {

		if (timeLimited) {
			// init de la date
			if (lastUpdateDate == null) {
				lastUpdateDate = new Date();
			}

			// si la durée de vie du cache a expiré, on le vide
			if ((new Date().getTime()) - lastUpdateDate.getTime() >= maxLifeTime) {
				cachemap.clear();
				lastUpdateDate = new Date();
			}
		}

		return cachemap.get(key);
	}

	/**
	 * LocalCache Factory.
	 */
	public static LocalCache getLocalCache() {
		return new LocalCache();
	}

	/**
	 * Put an Object in cache.
	 */
	public void put(Object key, Object value) {
		// Si la taille du cache est trop grande, le cache est remis � z�ro
		if ((maxSize != -1) && (cachemap.size() >= maxSize)) {
			cachemap.clear();
			lastUpdateDate = new Date();
		}

		cachemap.put(key, value);
	}

	/**
	 * Reset the cache.
	 */
	public void reset() {
		cachemap.clear();
		lastUpdateDate = new Date();
	}

	/**
	 * @return Date The last time the cache was updated
	 */
	public Date getLastUpdateDate() {
		return new Date(lastUpdateDate.getTime());
	}

	/**
	 * @param date
	 */
	public void setLastUpdateDate(Date date) {
		lastUpdateDate = new Date(date.getTime());
	}

	/**
	 * @return boolean true is the cache is time limited.
	 */
	public boolean isTimeLimited() {
		return timeLimited;
	}

	/**
	 * @param isTimeLimited
	 */
	public void setTimeLimited(boolean isTimeLimited) {
		timeLimited = isTimeLimited;
	}

	/**
	 * @return long the max life time of the cache
	 */
	public long getMaxLifeTime() {
		return maxLifeTime;
	}

	/**
	 * @param lifetime
	 */
	public void setMaxLifeTime(long lifetime) {
		maxLifeTime = lifetime;
	}

}